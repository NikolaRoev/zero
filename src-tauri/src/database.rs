use std::collections::HashMap;
use rusqlite::named_params;



const CREATE_QUERY: &str = "
CREATE TABLE IF NOT EXISTS works (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL,
    chapter TEXT NOT NULL,
    status  TEXT NOT NULL,
    type    TEXT NOT NULL,
    format  TEXT NOT NULL,
    updated TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')) NOT NULL,
    added   TEXT DEFAULT (DATETIME('NOW', 'LOCALTIME')) NOT NULL
);

CREATE TABLE IF NOT EXISTS creators (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL,
    works INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS work_creator (
    work_id     INTEGER NOT NULL,
    creator_id  INTEGER NOT NULL,
    PRIMARY KEY (work_id, creator_id),
    FOREIGN KEY (work_id)    REFERENCES works    (id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES creators (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS statuses (
    id     INTEGER PRIMARY KEY,
    status TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS types (
    id   INTEGER PRIMARY KEY,
    type TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS formats (
    id     INTEGER PRIMARY KEY,
    format TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS update_statuses (
    id     INTEGER PRIMARY KEY,
    status TEXT NOT NULL UNIQUE
);


CREATE TRIGGER IF NOT EXISTS check_work_insert
    BEFORE INSERT
    ON works
    WHEN NEW.status NOT IN (SELECT status FROM statuses) OR
         NEW.type NOT IN (SELECT type FROM types) OR
         NEW.format NOT IN (SELECT format FROM formats)
BEGIN
    SELECT RAISE(ABORT, 'Invalid work');
END;

CREATE TRIGGER IF NOT EXISTS check_work_update
    BEFORE UPDATE OF 'status', 'type', 'format'
    ON works
    WHEN NEW.status NOT IN (SELECT status FROM statuses) OR
         NEW.type NOT IN (SELECT type FROM types) OR
         NEW.format NOT IN (SELECT format FROM formats)
BEGIN
    SELECT RAISE(ABORT, 'Invalid work update value');
END;

CREATE TRIGGER IF NOT EXISTS update_work_chapter
    AFTER UPDATE OF 'chapter'
    ON works
BEGIN
    UPDATE works SET updated = DATETIME('NOW', 'LOCALTIME') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_status_insert
    BEFORE INSERT
    ON update_statuses
    WHEN NEW.status NOT IN (SELECT status FROM statuses)
BEGIN
    SELECT RAISE(ABORT, 'Invalid update status');
END;

CREATE TRIGGER IF NOT EXISTS delete_status
    BEFORE DELETE
    ON statuses
    WHEN (SELECT COUNT(*) FROM works WHERE status = OLD.status) > 0 OR
         (SELECT COUNT(*) FROM update_statuses WHERE status = OLD.status) > 0
BEGIN
    SELECT RAISE(ABORT, 'Status still in use');
END;

CREATE TRIGGER IF NOT EXISTS delete_type
    BEFORE DELETE
    ON types
    WHEN (SELECT COUNT(*) FROM works WHERE type = OLD.type) > 0
BEGIN
    SELECT RAISE(ABORT, 'Type still in use');
END;

CREATE TRIGGER IF NOT EXISTS delete_format
    BEFORE DELETE
    ON formats
    WHEN (SELECT COUNT(*) FROM works WHERE format = OLD.format) > 0
BEGIN
    SELECT RAISE(ABORT, 'Format still in use');
END;

CREATE TRIGGER IF NOT EXISTS add_work
    AFTER INSERT
    ON work_creator
BEGIN
    UPDATE creators
    SET works = (SELECT COUNT(*) FROM work_creator WHERE creator_id = NEW.creator_id)
    WHERE id = NEW.creator_id;
END;

CREATE TRIGGER IF NOT EXISTS remove_work
    AFTER DELETE
    ON work_creator
BEGIN
    UPDATE creators
    SET works = (SELECT COUNT(*) FROM work_creator WHERE creator_id = OLD.creator_id)
    WHERE id = OLD.creator_id;
END;
";

pub struct Work {
    id: i64,
    name: String,
    chapter: String,
    status: String,
    r#type: String,
    format: String,
    updated: String,
    added: String
}

pub struct Creator {
    id: i64,
    name: String,
    works: i64
}

pub struct Filter {
    selection: Vec<String>,
    by: String,
    value: String,
    restrictions: HashMap<String, Vec<String>>
}

pub struct Order {
    by: String,
    descending: bool
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

    pub fn open(&mut self, path: impl AsRef<std::path::Path>) -> DatabaseResult<()> {
        let mut conn = rusqlite::Connection::open(path)?;
        conn.profile(Some(|val, duration| log::trace!("{val} - {:?}", duration)));
        conn.execute_batch(CREATE_QUERY)?;

        self.conn = Some(conn);
        Ok(())
    }

    pub fn is_open(&self) -> bool {
        self.conn.is_some()
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

    pub fn path(&self) -> DatabaseResult<std::path::PathBuf> {
        Ok(self.conn()?.path().ok_or("Invalid path to database.")?.into())
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

    pub fn update(&self, table: &str, column: &str, id: i64, value: &str) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(&format!(
            "UPDATE {table} SET {column} = :value WHERE id = :id"
        ))?;
        
        let rows = stmt.execute(named_params! {":value": value, ":id": id})?;

        if rows != 1 {
            return Err(format!(
                "Expected to update 1 row of column '{column}' to value '{value}' in table '{table}' not {rows}"
            ))?;
        }

        Ok(())
    }

    pub fn get_work(&self, id: i64) -> DatabaseResult<Work> {
        let mut stmt = self.conn()?.prepare_cached("
            SELECT * FROM works WHERE id = :id
        ")?;

        let work = stmt.query_row(named_params! {":id": id}, |row| {
            Ok(Work {
                id: row.get(0)?,
                name: row.get(1)?,
                chapter: row.get(2)?,
                status: row.get(3)?,
                r#type: row.get(4)?,
                format: row.get(5)?,
                updated: row.get(6)?,
                added: row.get(7)?,
            })
        })?;

        Ok(work)
    }

    pub fn get_works(
        &self, 
        filter: Filter,
        order: Option<Order>
    ) -> DatabaseResult<Vec<Work>>{
        let helper = |column: &str, values: &Vec<String>| {
            let placeholders = vec!["?"; values.len()].join(",");
            format!(" AND {column} IN ({placeholders})")
        };

        let mut query = format!("SELECT {columns} FROM works WHERE {by} LIKE ?",
            columns = filter.selection.join(","),
            by = filter.by
        );

        let mut params = vec![filter.value];
        for (column, values) in filter.restrictions.iter() {
            query.push_str(&helper(column, values));
            params.extend(values.to_vec());
        }

        if let Some(Order {by, descending}) = order {
            query.push_str(&format!(" ORDER BY {by}"));
            if descending {
                query.push_str(" DESC")
            }
        }

        let mut stmt = self.conn()?.prepare_cached(&query)?;
        let rows = stmt.query_map(rusqlite::params_from_iter(params), |row| {
            Ok(Work {
                id: row.get(0)?,
                name: row.get(1)?,
                chapter: row.get(2)?,
                status: row.get(3)?,
                r#type: row.get(4)?,
                format: row.get(5)?,
                updated: row.get(6)?,
                added: row.get(7)?,
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_work_creators(&self, work_id: i64) -> DatabaseResult<Vec<Creator>> {
        let mut stmt = self.conn()?.prepare_cached("
            SELECT * FROM creators JOIN work_creator ON id = creator_id AND work_id = :work_id
        ")?;

        let rows = stmt.query_map(named_params! {":work_id": work_id}, |row| {
            Ok(Creator {
                id: row.get(0)?,
                name: row.get(1)?,
                works: row.get(2)?
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_creator(&self, id: i64) -> DatabaseResult<Creator> {
        let mut stmt = self.conn()?.prepare_cached("
            SELECT * FROM creators WHERE id = :id
        ")?;

        let creator = stmt.query_row(named_params! {":id": id}, |row| {
            Ok(Creator {
                id: row.get(0)?,
                name: row.get(1)?,
                works: row.get(2)?
            })
        })?;

        Ok(creator)
    }

    pub fn get_creators(&self, name: &str, order: Option<Order>) -> DatabaseResult<Vec<Creator>> {
        let mut query = String::from("SELECT * FROM creators WHERE name LIKE :name");
        if let Some(Order {by, descending}) = order {
            query.push_str(&format!(" ORDER BY {by}"));
            if descending {
                query.push_str(" DESC")
            }
        }
        
        let mut stmt = self.conn()?.prepare_cached(&query)?;
        let rows = stmt.query_map(named_params! {":name": format!("%{name}%")}, |row| {
            Ok(Creator {
                id: row.get(0)?,
                name: row.get(1)?,
                works: row.get(2)?
            })
        })?;

        rows.map(|row| Ok(row?)).collect()
    }

    pub fn get_creator_works(&self, creator_id: i64) -> DatabaseResult<Vec<Work>> {
        let mut stmt = self.conn()?.prepare_cached("
            SELECT * FROM works JOIN work_creator ON id = work_id AND creator_id = :creator_id
        ")?;

        let rows = stmt.query_map(named_params! {":creator_id": creator_id}, |row| {
            Ok(Work {
                id: row.get(0)?,
                name: row.get(1)?,
                chapter: row.get(2)?,
                status: row.get(3)?,
                r#type: row.get(4)?,
                format: row.get(5)?,
                updated: row.get(6)?,
                added: row.get(7)?
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
    use super::*;
    use uuid::Uuid;


    struct Context {
        name: String,
        database: Database
    }

    impl Context {
        pub fn new() -> Self {
            let name = format!("{}.db", Uuid::new_v4());
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

        let test: Vec<(&str, &dyn rusqlite::ToSql)> = vec![("name", &"name"), ("chapter", &"chapter"), ("status", &"status"), ("type", &"type"), ("format", &"format")];
        //database.add_creator("test", &[]);
        database.add("statuses", vec![("status", &"status")]).unwrap();
        database.add("types", vec![("type", &"type")]).unwrap();
        database.add("formats", vec![("format", &"format")]).unwrap();
        database.add("works",
        test).unwrap();

        //let id = database.add_work("name", "chapter", "status", "r#type", "format", &[]).unwrap();
        //std::thread::sleep(std::time::Duration::from_secs(4));
        //database.update("works", "chapter", id, "12");

        //creators.iter().try_for_each(|creator_id| self.attach(work_id, *creator_id))?;
    }
}
