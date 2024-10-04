use rusqlite::named_params;
use std::path::PathBuf;

const CREATE_QUERY: &str = "
CREATE TABLE IF NOT EXISTS works (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    progress TEXT NOT NULL,
    status   INTEGER NOT NULL,
    type     INTEGER NOT NULL,
    format   INTEGER NOT NULL,
    updated  INTEGER NOT NULL,
    added    INTEGER NOT NULL,
    FOREIGN KEY (status) REFERENCES statuses (id),
    FOREIGN KEY (type)   REFERENCES types    (id),
    FOREIGN KEY (format) REFERENCES formats  (id)
);

CREATE TABLE IF NOT EXISTS creators (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_creator (
    work_id     INTEGER NOT NULL,
    creator_id  INTEGER NOT NULL,
    PRIMARY KEY (work_id, creator_id),
    FOREIGN KEY (work_id)    REFERENCES works    (id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES creators (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS statuses (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL UNIQUE,
    is_update INTEGER NOT NULL CHECK (is_update IN (0, 1)) DEFAULT 0,
    sort      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS types (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS formats (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort INTEGER NOT NULL DEFAULT 0
);



CREATE TRIGGER IF NOT EXISTS status_add
    AFTER INSERT
    ON statuses
    WHEN (SELECT COUNT(*) FROM statuses) > 1
BEGIN
    UPDATE statuses SET sort = (SELECT MAX(sort) FROM statuses) + 1
    WHERE id == NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS status_delete
    AFTER DELETE
    ON statuses
BEGIN
    UPDATE statuses SET sort = sort - 1
    WHERE sort > OLD.sort;
END;


CREATE TRIGGER IF NOT EXISTS type_add
    AFTER INSERT
    ON types
    WHEN (SELECT COUNT(*) FROM types) > 1
BEGIN
    UPDATE types SET sort = (SELECT MAX(sort) FROM types) + 1
    WHERE id == NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS type_delete
    AFTER DELETE
    ON types
BEGIN
    UPDATE types SET sort = sort - 1
    WHERE sort > OLD.sort;
END;


CREATE TRIGGER IF NOT EXISTS format_add
    AFTER INSERT
    ON formats
    WHEN (SELECT COUNT(*) FROM formats) > 1
BEGIN
    UPDATE formats SET sort = (SELECT MAX(sort) FROM formats) + 1
    WHERE id == NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS format_delete
    AFTER DELETE
    ON formats
BEGIN
    UPDATE formats SET sort = sort - 1
    WHERE sort > OLD.sort;
END;
";

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Work {
    pub id: i64,
    pub name: String,
    pub progress: String,
    pub status: i64,
    pub r#type: i64,
    pub format: i64,
    pub updated: i64,
    pub added: i64,
    pub creators: Vec<i64>,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Creator {
    pub id: i64,
    pub name: String,
    pub works: Vec<i64>,
}

#[derive(serde::Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub id: i64,
    pub name: String,
    pub is_update: bool,
}

#[derive(serde::Serialize, Debug)]
pub struct Type {
    id: i64,
    name: String,
}

#[derive(serde::Serialize, Debug)]
pub struct Format {
    id: i64,
    name: String,
}

pub type DatabaseResult<T> = Result<T, Box<dyn std::error::Error>>;

#[derive(Default)]
pub struct Database {
    conn: Option<rusqlite::Connection>,
}

impl Database {
    fn conn(&self) -> DatabaseResult<&rusqlite::Connection> {
        self.conn.as_ref().ok_or("No connection to database".into())
    }

    pub fn open(&mut self, path: &PathBuf) -> DatabaseResult<()> {
        let mut conn = rusqlite::Connection::open(path)?;
        conn.profile(Some(|val, duration| log::trace!("{val} - {:?}", duration)));
        conn.backup(
            rusqlite::DatabaseName::Main,
            path.with_extension("backup.db"),
            Some(|progress| {
                log::info!(
                    "Backing up: {}/{}.",
                    progress.pagecount - progress.remaining,
                    progress.pagecount
                );
            }),
        )?;
        conn.execute_batch(CREATE_QUERY)?;

        self.conn = Some(conn);
        Ok(())
    }

    pub fn close(&mut self) -> DatabaseResult<()> {
        let conn = self.conn.take();
        if let Some(conn) = conn {
            if let Err((conn, err)) = conn.close() {
                self.conn = Some(conn);
                Err(err.into())
            } else {
                Ok(())
            }
        } else {
            Err("No connection to close.".into())
        }
    }

    pub fn path(&self) -> Option<std::path::PathBuf> {
        self.conn()
            .map(|conn| conn.path())
            .unwrap_or(None)
            .map(Into::into)
    }

    pub fn add(
        &self,
        table: &str,
        params: Vec<(&str, &dyn rusqlite::ToSql)>,
    ) -> DatabaseResult<i64> {
        let (columns, values): (Vec<&str>, Vec<&dyn rusqlite::ToSql>) = params.into_iter().unzip();
        let mut stmt = self.conn()?.prepare_cached(&format!(
            "
            INSERT INTO {table} ({columns}) VALUES ({placeholders})
        ",
            columns = columns.join(","),
            placeholders = vec!["?"; values.len()].join(",")
        ))?;

        Ok(stmt.insert(rusqlite::params_from_iter(values))?)
    }

    pub fn remove(&self, table: &str, id: i64) -> DatabaseResult<()> {
        let mut stmt = self
            .conn()?
            .prepare_cached(&format!("DELETE FROM {table} WHERE id = :id"))?;

        let rows = stmt.execute(named_params! {":id": id})?;

        if rows != 1 {
            return Err(format!(
                "Expected to remove 1 item from table '{table}' not {rows}"
            ))?;
        }

        Ok(())
    }

    pub fn update(
        &self,
        table: &str,
        id: &dyn rusqlite::ToSql,
        params: Vec<(&str, &dyn rusqlite::ToSql)>,
    ) -> DatabaseResult<()> {
        let (columns, mut values): (Vec<&str>, Vec<&dyn rusqlite::ToSql>) =
            params.into_iter().unzip();
        values.push(id);
        let placeholders = columns
            .iter()
            .map(|&column| format!("{column} = ?"))
            .collect::<Vec<_>>()
            .join(", ");

        let mut stmt = self
            .conn()?
            .prepare_cached(&format!("UPDATE {table} SET {placeholders} WHERE id = ?"))?;

        let rows = stmt.execute(rusqlite::params_from_iter(values))?;

        if rows != 1 {
            return Err(format!("Expected to update 1 row not {rows}"))?;
        }

        Ok(())
    }

    pub fn get_works(&self) -> DatabaseResult<Vec<Work>> {
        let mut stmt = self.conn()?.prepare_cached("
            SELECT works.id, works.name, works.progress, works.status, works.type, works.format,
                   works.updated, works.added, group_concat(work_creator.creator_id ORDER BY work_creator.ROWID)
            FROM works
            LEFT JOIN work_creator ON works.id = work_creator.work_id
            GROUP BY works.id
        ")?;

        let rows = stmt.query_map([], |row| {
            let id: i64 = row.get(0)?;
            let creators_row: Option<String> = row.get(8)?;
            let creators = creators_row
                .map_or(Ok(vec![]), |data| {
                    data.split(',')
                        .map(|c| c.parse::<i64>())
                        .collect::<Result<Vec<_>, _>>()
                })
                .map_err(|err| rusqlite::Error::UserFunctionError(Box::new(err)))?;

            Ok(Work {
                id,
                name: row.get(1)?,
                progress: row.get(2)?,
                status: row.get(3)?,
                r#type: row.get(4)?,
                format: row.get(5)?,
                updated: row.get(6)?,
                added: row.get(7)?,
                creators,
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_creators(&self) -> DatabaseResult<Vec<Creator>> {
        let mut stmt = self.conn()?.prepare_cached("
            SELECT creators.id, creators.name, group_concat(work_creator.work_id ORDER BY work_creator.ROWID)
            FROM creators
            LEFT JOIN work_creator ON creators.id = work_creator.creator_id
            GROUP BY creators.id
        ")?;

        let rows = stmt.query_map([], |row| {
            let id: i64 = row.get(0)?;
            let works_row: Option<String> = row.get(2)?;
            let works = works_row
                .map_or(Ok(vec![]), |data| {
                    data.split(',')
                        .map(|c| c.parse::<i64>())
                        .collect::<Result<Vec<_>, _>>()
                })
                .map_err(|err| rusqlite::Error::UserFunctionError(Box::new(err)))?;

            Ok(Creator {
                id,
                name: row.get(1)?,
                works,
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_statuses(&self) -> DatabaseResult<Vec<Status>> {
        let mut stmt = self
            .conn()?
            .prepare_cached("SELECT id, name, is_update FROM statuses ORDER BY sort")?;
        let rows = stmt.query_map([], |row| {
            Ok(Status {
                id: row.get(0)?,
                name: row.get(1)?,
                is_update: row.get(2)?,
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_types(&self) -> DatabaseResult<Vec<Type>> {
        let mut stmt = self
            .conn()?
            .prepare_cached("SELECT * FROM types ORDER BY sort")?;
        let rows = stmt.query_map([], |row| {
            Ok(Type {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_formats(&self) -> DatabaseResult<Vec<Format>> {
        let mut stmt = self
            .conn()?
            .prepare_cached("SELECT * FROM formats ORDER BY sort")?;
        let rows = stmt.query_map([], |row| {
            Ok(Format {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn attach(&self, work_id: i64, creator_id: i64) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(
            "
            INSERT INTO work_creator (work_id, creator_id) VALUES (:work_id, :creator_id)
        ",
        )?;

        stmt.insert(named_params! { ":work_id": work_id, ":creator_id": creator_id })?;

        Ok(())
    }

    pub fn detach(&self, work_id: i64, creator_id: i64) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(
            "DELETE FROM work_creator WHERE work_id = :work_id AND creator_id = :creator_id",
        )?;

        let rows = stmt.execute(named_params! {":work_id": work_id, ":creator_id": creator_id})?;

        if rows != 1 {
            return Err(format!("Expected to detach 1 pair not {rows}"))?;
        }

        Ok(())
    }

    pub fn reorder(&self, table: &str, active_id: &i64, over_id: &i64) -> DatabaseResult<()> {
        let mut stmt = self
            .conn()?
            .prepare_cached(&format!("SELECT sort FROM {table} WHERE id = :active_id"))?;
        let rows = stmt.query_map(named_params! {":active_id": active_id}, |row| {
            row.get::<usize, i64>(0)
        })?;
        let sort_active = rows
            .map(|row| Ok(row?))
            .collect::<DatabaseResult<Vec<i64>>>()?;
        let sort_active = sort_active.first().ok_or("Missing active item sort")?;

        let mut stmt = self
            .conn()?
            .prepare_cached(&format!("SELECT sort FROM {table} WHERE id = :over_id"))?;
        let rows = stmt.query_map(named_params! {":over_id": over_id}, |row| {
            row.get::<usize, i64>(0)
        })?;
        let sort_over = rows
            .map(|row| Ok(row?))
            .collect::<DatabaseResult<Vec<i64>>>()?;
        let sort_over = sort_over.first().ok_or("Missing over item sort")?;

        let mut stmt = self.conn()?.prepare_cached(&format!(
            "UPDATE {table} SET sort = :sort_over WHERE id = :active_id"
        ))?;
        let rows =
            stmt.execute(named_params! {":sort_over": sort_over, ":active_id": active_id})?;
        if rows != 1 {
            return Err(format!("Expected to update 1 row not {rows}"))?;
        }

        // Move item up.
        if sort_active > sort_over {
            let mut stmt = self.conn()?.prepare_cached(&format!(
                "UPDATE {table} SET sort = sort + 1 WHERE sort >= :sort_over AND sort < :sort_active AND id != :active_id"
            ))?;
            stmt.execute(named_params! {":sort_over": sort_over, ":sort_active": sort_active, ":active_id": active_id})?;
        }
        // Move item down.
        else {
            let mut stmt = self.conn()?.prepare_cached(&format!(
                "UPDATE {table} SET sort = sort - 1 WHERE sort <= :sort_over AND sort > :sort_active AND id != :active_id"
            ))?;
            stmt.execute(named_params! {":sort_over": sort_over, ":sort_active": sort_active, ":active_id": active_id})?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    struct Context {
        id: Uuid,
        database: Database,
    }

    impl Context {
        pub fn new() -> Self {
            let id = Uuid::new_v4();
            let mut database = Database::default();
            database
                .open(&std::path::PathBuf::from(format!("{id}.db")))
                .unwrap();
            Context { id, database }
        }
    }

    impl Drop for Context {
        fn drop(&mut self) {
            self.database.close().unwrap();
            std::fs::remove_file(std::path::PathBuf::from(format!("{}.db", self.id))).unwrap();
            std::fs::remove_file(std::path::PathBuf::from(format!("{}.backup.db", self.id)))
                .unwrap();
        }
    }

    #[test]
    fn can_modify_work() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        // Add.
        let status_id = database.add("statuses", vec![("name", &"status")])?;
        let type_id = database.add("types", vec![("name", &"type")])?;
        let format_id = database.add("formats", vec![("name", &"format")])?;
        let id = database.add(
            "works",
            vec![
                ("name", &"name"),
                ("progress", &"progress"),
                ("status", &status_id),
                ("type", &format_id),
                ("format", &format_id),
                ("updated", &44i64),
                ("added", &44i64),
            ],
        )?;
        let works = database.get_works()?;
        let added_work = works.first().unwrap();

        assert_eq!(works.len(), 1);
        assert_eq!(added_work.id, id);
        assert_eq!(added_work.name, "name");
        assert_eq!(added_work.progress, "progress");
        assert_eq!(added_work.status, status_id);
        assert_eq!(added_work.r#type, type_id);
        assert_eq!(added_work.format, format_id);
        assert_eq!(added_work.updated, 44i64);
        assert_eq!(added_work.added, 44i64);

        // Update.
        database.update(
            "works",
            &id,
            vec![("name", &"new_name"), ("progress", &"new_progress")],
        )?;
        let works = database.get_works()?;
        let added_work = works.first().unwrap();

        assert_eq!(works.len(), 1);
        assert_eq!(added_work.id, id);
        assert_eq!(added_work.name, "new_name");
        assert_eq!(added_work.progress, "new_progress");

        // Remove.
        database.remove("works", id)?;

        let works = database.get_works()?;
        assert_eq!(works.len(), 0);

        Ok(())
    }

    #[test]
    fn catches_adding_work_with_invalid_status_type_or_format() {
        let database = &Context::new().database;

        let error_message = database
            .add(
                "works",
                vec![
                    ("name", &"name"),
                    ("progress", &"progress"),
                    ("status", &1i64),
                    ("type", &1i64),
                    ("format", &1i64),
                    ("updated", &44i64),
                    ("added", &44i64),
                ],
            )
            .unwrap_err()
            .to_string();

        assert_eq!(error_message, "FOREIGN KEY constraint failed");
    }

    #[test]
    fn can_modify_creator() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        // Add.
        let id = database.add("creators", vec![("name", &"name")])?;
        let creators = database.get_creators()?;
        let added_creator = creators.first().unwrap();

        assert_eq!(creators.len(), 1);
        assert_eq!(added_creator.id, id);
        assert_eq!(added_creator.name, "name");

        // Update.
        database.update("creators", &id, vec![("name", &"new_name")])?;
        let creators = database.get_creators()?;
        let added_creator = creators.first().unwrap();

        assert_eq!(creators.len(), 1);
        assert_eq!(added_creator.id, id);
        assert_eq!(added_creator.name, "new_name");

        // Remove.
        database.remove("creators", id)?;

        let creators = database.get_creators()?;
        assert_eq!(creators.len(), 0);

        Ok(())
    }

    #[test]
    fn can_modify_status() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        // Add.
        let id = database.add("statuses", vec![("name", &"status")])?;
        let statuses = database.get_statuses()?;
        let added_status = statuses.first().unwrap();

        assert_eq!(statuses.len(), 1);
        assert_eq!(added_status.id, id);
        assert_eq!(added_status.name, "status");

        // Update.
        database.update("statuses", &id, vec![("name", &"new_name")])?;
        let statuses = database.get_statuses()?;
        let added_status = statuses.first().unwrap();

        assert_eq!(statuses.len(), 1);
        assert_eq!(added_status.id, id);
        assert_eq!(added_status.name, "new_name");

        // Remove.
        database.remove("statuses", id)?;

        let statuses = database.get_statuses()?;
        assert_eq!(statuses.len(), 0);

        Ok(())
    }

    #[test]
    fn can_modify_type() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        // Add.
        let id = database.add("types", vec![("name", &"type")])?;
        let types = database.get_types()?;
        let added_type = types.first().unwrap();

        assert_eq!(types.len(), 1);
        assert_eq!(added_type.id, id);
        assert_eq!(added_type.name, "type");

        // Update.
        database.update("types", &id, vec![("name", &"new_name")])?;
        let types = database.get_types()?;
        let added_type = types.first().unwrap();

        assert_eq!(types.len(), 1);
        assert_eq!(added_type.id, id);
        assert_eq!(added_type.name, "new_name");

        // Remove.
        database.remove("types", id)?;

        let types = database.get_types()?;
        assert_eq!(types.len(), 0);

        Ok(())
    }

    #[test]
    fn can_modify_format() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        // Add.
        let id = database.add("formats", vec![("name", &"format")])?;
        let formats = database.get_formats()?;
        let added_format = formats.first().unwrap();

        assert_eq!(formats.len(), 1);
        assert_eq!(added_format.id, id);
        assert_eq!(added_format.name, "format");

        // Update.
        database.update("formats", &id, vec![("name", &"new_name")])?;
        let formats = database.get_formats()?;
        let added_format = formats.first().unwrap();

        assert_eq!(formats.len(), 1);
        assert_eq!(added_format.id, id);
        assert_eq!(added_format.name, "new_name");

        // Remove.
        database.remove("formats", id)?;

        let formats = database.get_formats()?;
        assert_eq!(formats.len(), 0);

        Ok(())
    }

    #[test]
    fn catches_removing_status_type_or_format_currently_in_use(
    ) -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        let status_id = database.add("statuses", vec![("name", &"status")])?;
        let type_id = database.add("types", vec![("name", &"type")])?;
        let format_id = database.add("formats", vec![("name", &"format")])?;
        database.add(
            "works",
            vec![
                ("name", &"name"),
                ("progress", &"progress"),
                ("status", &status_id),
                ("type", &type_id),
                ("format", &format_id),
                ("updated", &44i64),
                ("added", &44i64),
            ],
        )?;
        let status_error_message = database
            .remove("statuses", status_id)
            .unwrap_err()
            .to_string();
        let type_error_message = database.remove("types", type_id).unwrap_err().to_string();
        let format_error_message = database
            .remove("formats", format_id)
            .unwrap_err()
            .to_string();

        assert_eq!(status_error_message, "FOREIGN KEY constraint failed");
        assert_eq!(type_error_message, "FOREIGN KEY constraint failed");
        assert_eq!(format_error_message, "FOREIGN KEY constraint failed");

        Ok(())
    }

    #[test]
    fn can_attach_and_detach() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        let status_id = database.add("statuses", vec![("name", &"status")])?;
        let type_id = database.add("types", vec![("name", &"type")])?;
        let format_id = database.add("formats", vec![("name", &"format")])?;
        let work_id = database.add(
            "works",
            vec![
                ("name", &"name"),
                ("progress", &"progress"),
                ("status", &status_id),
                ("type", &type_id),
                ("format", &format_id),
                ("updated", &44i64),
                ("added", &44i64),
            ],
        )?;
        let creator_id = database.add("creators", vec![("name", &"name")])?;
        database.attach(work_id, creator_id)?;
        let works = database.get_works()?;
        let added_work = works.first().unwrap();
        let creators = database.get_creators()?;
        let added_creator = creators.first().unwrap();

        assert_eq!(added_work.creators.len(), 1);
        assert_eq!(added_creator.works.len(), 1);
        assert_eq!(*added_work.creators.first().unwrap(), creator_id);
        assert_eq!(*added_creator.works.first().unwrap(), work_id);

        database.detach(work_id, creator_id)?;
        let works = database.get_works()?;
        let added_work = works.first().unwrap();
        let creators = database.get_creators()?;
        let added_creator = creators.first().unwrap();

        assert_eq!(added_work.creators.len(), 0);
        assert_eq!(added_creator.works.len(), 0);

        Ok(())
    }

    #[test]
    fn catches_invalid_attach_and_detach() {
        let database = &Context::new().database;

        let error_message = database.attach(1, 1).unwrap_err().to_string();

        assert_eq!(error_message, "FOREIGN KEY constraint failed");

        let error_message = database.detach(1, 1).unwrap_err().to_string();

        assert_eq!(error_message, "Expected to detach 1 pair not 0");
    }

    #[test]
    fn removing_work_detaches() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        let status_id = database.add("statuses", vec![("name", &"status")])?;
        let type_id = database.add("types", vec![("name", &"type")])?;
        let format_id = database.add("formats", vec![("name", &"format")])?;
        let work_id = database.add(
            "works",
            vec![
                ("name", &"name"),
                ("progress", &"progress"),
                ("status", &status_id),
                ("type", &type_id),
                ("format", &format_id),
                ("updated", &44i64),
                ("added", &44i64),
            ],
        )?;
        let creator_id = database.add("creators", vec![("name", &"name")])?;
        database.attach(work_id, creator_id)?;
        database.remove("works", work_id)?;
        let creators = database.get_creators()?;
        let added_creator = creators.first().unwrap();

        assert_eq!(added_creator.works.len(), 0);

        Ok(())
    }

    #[test]
    fn removing_creator_detaches() -> Result<(), Box<dyn std::error::Error>> {
        let database = &Context::new().database;

        let status_id = database.add("statuses", vec![("name", &"status")])?;
        let type_id = database.add("types", vec![("name", &"type")])?;
        let format_id = database.add("formats", vec![("name", &"format")])?;
        let work_id = database.add(
            "works",
            vec![
                ("name", &"name"),
                ("progress", &"progress"),
                ("status", &status_id),
                ("type", &type_id),
                ("format", &format_id),
                ("updated", &44i64),
                ("added", &44i64),
            ],
        )?;
        let creator_id = database.add("creators", vec![("name", &"name")])?;
        database.attach(work_id, creator_id)?;
        database.remove("creators", creator_id)?;
        let works = database.get_works()?;
        let added_work = works.first().unwrap();

        assert_eq!(added_work.creators.len(), 0);

        Ok(())
    }
}
