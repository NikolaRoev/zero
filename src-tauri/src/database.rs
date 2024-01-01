use std::path::PathBuf;
use rusqlite::named_params;



const CREATE_QUERY: &str = "
CREATE TABLE IF NOT EXISTS works (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    progress TEXT NOT NULL,
    status   TEXT NOT NULL,
    type     TEXT NOT NULL,
    format   TEXT NOT NULL,
    updated  INTEGER NOT NULL,
    added    INTEGER NOT NULL,
    FOREIGN KEY (status) REFERENCES statuses (name) ON UPDATE CASCADE,
    FOREIGN KEY (type)   REFERENCES types    (name) ON UPDATE CASCADE,
    FOREIGN KEY (format) REFERENCES formats  (name) ON UPDATE CASCADE
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
    is_update INTEGER NOT NULL CHECK (is_update IN (0, 1)) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS types (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS formats (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
";

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Work {
    pub id: i64,
    pub name: String,
    pub progress: String,
    pub status: String,
    pub r#type: String,
    pub format: String,
    pub updated: i64,
    pub added: i64,
    pub creators: Vec<i64>
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct Creator {
    pub id: i64,
    pub name: String,
    pub works: Vec<i64>
}

#[derive(serde::Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub id: i64,
    pub name: String,
    pub is_update: bool
}

#[derive(serde::Serialize, Debug)]
pub struct Type {
    id: i64,
    name: String
}

#[derive(serde::Serialize, Debug)]
pub struct Format {
    id: i64,
    name: String
}


pub type DatabaseResult<T> = Result<T, Box<dyn std::error::Error>>;

#[derive(Default)]
pub struct Database {
    conn: Option<rusqlite::Connection>
}

impl Database {
    fn conn(&self) -> DatabaseResult<&rusqlite::Connection> {
        self.conn.as_ref().ok_or("No connection to database.".into())
    }

    pub fn open(&mut self, path: &PathBuf) -> DatabaseResult<()> {
        let mut conn = rusqlite::Connection::open(path)?;
        //conn.profile(Some(|val, duration| log::trace!("{val} - {:?}", duration)));
        conn.backup(rusqlite::DatabaseName::Main, path.with_extension("backup.db"), Some(|progress| {
            log::info!("Backing up: {}/{}.", progress.pagecount - progress.remaining, progress.pagecount);
        }))?;
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
            }
            else {
                Ok(())
            }
        }
        else {
            Err("No connection to close.".into())
        }
    }

    pub fn path(&self) -> Option<std::path::PathBuf> {
        self.conn().map(|conn| conn.path()).unwrap_or(None).map(Into::into)
    }

    pub fn add(&self, table: &str, params: Vec<(&str, &dyn rusqlite::ToSql)>) -> DatabaseResult<i64> {
        let (columns, values): (Vec<&str>, Vec<&dyn rusqlite::ToSql>) = params.into_iter().unzip();
        let mut stmt = self.conn()?.prepare_cached(&format!("
            INSERT INTO {table} ({columns}) VALUES ({placeholders})
        ",
        columns = columns.join(","),
        placeholders = vec!["?"; values.len()].join(",")))?;

        Ok(stmt.insert(rusqlite::params_from_iter(values))?)
    }

    pub fn remove(&self, table: &str, id: i64) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(&format!(
            "DELETE FROM {table} WHERE id = :id"
        ))?;

        let rows = stmt.execute(named_params! {":id": id})?;
        
        if rows != 1 {
            return Err(format!(
                "Expected to remove 1 item from table '{table}' not {rows}"
            ))?;
        }

        Ok(())
    }

    pub fn update(&self, table: &str, id: &dyn rusqlite::ToSql, params: Vec<(&str, &dyn rusqlite::ToSql)>) -> DatabaseResult<()> {
        let (columns, mut values): (Vec<&str>, Vec<&dyn rusqlite::ToSql>) = params.into_iter().unzip();
        values.push(id);
        let placeholders = columns.iter().map(| &column | format!("{column} = ?")).collect::<Vec<_>>().join(", ");

        let mut stmt = self.conn()?.prepare_cached(&format!(
            "UPDATE {table} SET {placeholders} WHERE id = ?"
        ))?;

        let rows = stmt.execute(rusqlite::params_from_iter(values))?;

        if rows != 1 {
            return Err(format!("Expected to update 1 row not {rows}"))?;
        }

        Ok(())
    }

    pub fn get_works(&self) -> DatabaseResult<Vec<Work>>{
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
            let creators = creators_row.map_or(
                Ok(vec![]),
                |data| data.split(',').map(|c| c.parse::<i64>()).collect::<Result<Vec<_>, _>>()
            ).map_err(|err| rusqlite::Error::UserFunctionError(Box::new(err)))?;

            Ok(Work {
                id,
                name: row.get(1)?,
                progress: row.get(2)?,
                status: row.get(3)?,
                r#type: row.get(4)?,
                format: row.get(5)?,
                updated: row.get(6)?,
                added: row.get(7)?,
                creators
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
            let works = works_row.map_or(
                Ok(vec![]),
                |data| data.split(',').map(|c| c.parse::<i64>()).collect::<Result<Vec<_>, _>>()
            ).map_err(|err| rusqlite::Error::UserFunctionError(Box::new(err)))?;

            Ok(Creator {
                id,
                name: row.get(1)?,
                works
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_statuses(&self) -> DatabaseResult<Vec<Status>> {
        let mut stmt = self.conn()?.prepare_cached("SELECT * FROM statuses")?;
        let rows = stmt.query_map([], |row| {
            Ok(Status {
                id: row.get(0)?,
                name: row.get(1)?,
                is_update: row.get(2)?
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_types(&self) -> DatabaseResult<Vec<Type>> {
        let mut stmt = self.conn()?.prepare_cached("SELECT * FROM types")?;
        let rows = stmt.query_map([], |row| {
            Ok(Type {
                id: row.get(0)?,
                name: row.get(1)?
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_formats(&self) -> DatabaseResult<Vec<Format>> {
        let mut stmt = self.conn()?.prepare_cached("SELECT * FROM formats")?;
        let rows = stmt.query_map([], |row| {
            Ok(Format {
                id: row.get(0)?,
                name: row.get(1)?
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn attach(&self, work_id: i64, creator_id: i64) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached("
            INSERT INTO work_creator (work_id, creator_id) VALUES (:work_id, :creator_id)
        ")?;

        stmt.insert(named_params! { ":work_id": work_id, ":creator_id": creator_id })?;

        Ok(())
    }

    pub fn detach(&self, work_id: i64, creator_id: i64) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(
            "DELETE FROM work_creator WHERE work_id = :work_id AND creator_id = :creator_id"
        )?;

        let rows = stmt.execute(named_params! {":work_id": work_id, ":creator_id": creator_id})?;
        
        if rows != 1 {
            return Err(format!(
                "Expected to detach 1 item not {rows}"
            ))?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::*;
    use uuid::Uuid;


    struct Context {
        name: PathBuf,
        database: Database
    }

    impl Context {
        pub fn new() -> Self {
            let name = PathBuf::from(&format!("{}.db", Uuid::new_v4()));
            let mut database = Database::default();
            database.open(&name).unwrap_or_else(|err| panic!("Failed to open database: {err}."));
            Context { name, database }
        }
    }

    impl Drop for Context {
        fn drop(&mut self) {
            self.database.close().unwrap_or_else(|err| panic!("Failed to close {err}."));

            //std::fs::remove_file(format!("{}.db", &self.name))
            //    .unwrap_or_else(|err| panic!("Failed to delete database: {err}."))
        }
    }

    #[test]
    fn test() {
        let database = &Context::new().database;

        let test: Vec<(&str, &dyn rusqlite::ToSql)> = vec![("name", &"name"), ("progress", &"progress"), ("status", &"status"), ("type", &"type"), ("format", &"format")];
        //database.add_creator("test", &[]);
        database.add("statuses", vec![("status", &"status")]).unwrap();
        database.add("types", vec![("type", &"type")]).unwrap();
        database.add("formats", vec![("format", &"format")]).unwrap();
        database.add("works",
        test).unwrap();

        //database.update("statuses", "is_update", 1, &true).unwrap();

        let test = database.get_statuses().unwrap();
        for t in test {
            println!("{} {} {}", t.id, t.name, t.is_update);
        }
        //let id = database.add_work("name", "progress", "status", "r#type", "format", &[]).unwrap();
        //std::thread::sleep(std::time::Duration::from_secs(4));
        //database.update("works", "progress", id, "12");

        //creators.iter().try_for_each(|creator_id| self.attach(work_id, *creator_id))?;

        //for i in 0..100_000 {
        //    let name = format!("name {i}");
        //    let progress = format!("progress {i}");
        //    let test: Vec<(&str, &dyn rusqlite::ToSql)> = vec![("name", &name), ("progress", &progress), ("status", &"status"), ("type", &"type"), ("format", &"format"), ("updated", &0i64), ("added", &0i64)];
        //    db_guard.add("works", test).unwrap();
        //}
    }
}
