use rusqlite::named_params;


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
    columns: Vec<String>,
    by: String,
    value: String
}

pub struct Order {
    by: String,
    descending: bool
}

#[derive(Debug)]
pub enum Error {
    NoConnection,
    Database(String),
    SQLite(rusqlite::Error)
}

impl PartialEq for Error {
    fn eq(&self, other: &Error) -> bool {
        match (self, other) {
            (Error::NoConnection, Error::NoConnection) => true,
            (Error::Database(msg1), Error::Database(msg2)) => msg1 == msg2,
            (Error::SQLite(e1), Error::SQLite(e2)) => e1 == e2,
            (..) => false
        }
    }
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match *self {
            Error::NoConnection => write!(f, "No connection to database"),
            Error::Database(ref msg) => write!(f, "{}", msg),
            Error::SQLite(ref err) => err.fmt(f),
        }
    }
}

impl From<rusqlite::Error> for Error {
    fn from(err: rusqlite::Error) -> Self {
        Error::SQLite(err)
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match *self {
            Error::SQLite(ref err) => Some(err),
            _ => None
        }
    }
}

const TYPES: &[&str] = &["Manga", "Manhwa", "Manhua", "OEL", "Novel"];
const FORMATS: &[&str] = &["Series", "One Shot", "Anthology"];

pub type DatabaseResult<T> = Result<T, Error>;

#[derive(Default)]
pub struct Database {
    conn: Option<rusqlite::Connection>
}

impl Database {
    fn conn(&self) -> DatabaseResult<&rusqlite::Connection> {
        self.conn.as_ref().ok_or(Error::NoConnection)
    }

    

    fn verify_type(r#type: &str) -> DatabaseResult<()> {
        if TYPES.contains(&r#type) { Ok(()) }
        else { Err(Error::Database(format!("Invalid type '{}'", r#type))) }
    }

    fn verify_format(format: &str) -> DatabaseResult<()> {
        if FORMATS.contains(&format) { Ok(()) }
        else { Err(Error::Database(format!("Invalid format '{format}'"))) }
    }

    pub fn open(&mut self, path: &str) -> DatabaseResult<()> {
        let mut conn = rusqlite::Connection::open(format!("{path}.db"))?;
        conn.profile(Some(|val, duration| log::trace!("{val} - {:?}", duration)));
        conn.backup(rusqlite::DatabaseName::Main, format!("{path}-backup.db"), None)?;
        self.conn = Some(conn);

        self.conn()?.execute_batch("
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
                creator_id  TEXT NOT NULL,
                PRIMARY KEY (work_id, creator_id),
                FOREIGN KEY (work_id)    REFERENCES works    (id) ON DELETE CASCADE,
                FOREIGN KEY (creator_id) REFERENCES creators (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS statuses (
                id     INTEGER PRIMARY KEY,
                status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS types (
                id   INTEGER PRIMARY KEY,
                type TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS formats (
                id     INTEGER PRIMARY KEY,
                format TEXT NOT NULL
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

            CREATE TRIGGER IF NOT EXISTS delete_status
                BEFORE DELETE
                ON statuses
                WHEN (SELECT COUNT(*) FROM works WHERE status = OLD.status) > 0
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
        ")?;

        Ok(())
    }

    pub fn add_work(
        &self, name: &str, chapter: &str, status: &str, r#type: &str, format: &str, creators: &[i64]
    ) -> DatabaseResult<i64> {
        let mut stmt = self.conn()?.prepare_cached("
            INSERT INTO works (name, chapter, status, type, format)
            VALUES (:name, :chapter, :status, :type, :format)
        ")?;

        let work_id = stmt.insert(named_params! {
            ":name": name, ":chapter": chapter, ":status": status, ":type": r#type, ":format": format
        })?;

        creators.iter().try_for_each(|creator_id| self.attach(work_id, *creator_id))?;

        Ok(work_id)
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
        statuses: &[&str],
        types: &[&str],
        formats: &[&str],
        order: Option<Order>
    ) -> DatabaseResult<Vec<Work>>{
        let helper = |column: &str, values: &[&str]| {
            let placeholders = vec!["?"; values.len()].join(",");
            format!(" AND {column} IN ({placeholders})")
        };

        let mut query = format!("SELECT {filter} FROM works WHERE {by} LIKE ?",
            filter = filter.columns.join(","),
            by = filter.by);
        let mut params = vec![filter.value.as_str()];
        
        if !statuses.is_empty() {
            query.push_str(&helper("status", statuses));
            params.extend_from_slice(statuses);
        }

        if !types.is_empty() {
            query.push_str(&helper("type", types));
            params.extend_from_slice(types);
        }

        if !formats.is_empty() {
            query.push_str(&helper("format", formats));
            params.extend_from_slice(formats);
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

    pub fn add_creator(&self, name: &str, works: &[i64]) -> DatabaseResult<i64> {
        let mut stmt = self.conn()?.prepare_cached("
            INSERT INTO creators (name) VALUES (:name)
        ")?;

        let creator_id = stmt.insert(named_params! { ":name": name })?;

        works.iter().try_for_each(|work_id| self.attach(*work_id, creator_id))?;

        Ok(creator_id)
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

    pub fn remove(&self, table: &str, id: i64) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(&format!(
            "DELETE FROM {table} WHERE id = :id"
        ))?;

        let rows = stmt.execute(named_params! {":id": id})?;
        
        if rows != 1 {
            return Err(Error::Database(format!(
                "Expected to remove 1 item from table '{table}' not {rows}"
            )));
        }

        Ok(())
    }

    pub fn update(&self, table: &str, column: &str, id: i64, value: &str) -> DatabaseResult<()> {
        let mut stmt = self.conn()?.prepare_cached(&format!(
            "UPDATE {table} SET {column} = :value WHERE id = :id"
        ))?;
        
        let rows = stmt.execute(named_params! {":value": value, ":id": id})?;

        if rows != 1 {
            return Err(Error::Database(format!(
                "Expected to update 1 row of column '{column}' to value '{value}' in table '{table}' not {rows}"
            )));
        }

        Ok(())
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
            return Err(Error::Database(format!(
                "Expected to detach 1 item not {rows}"
            )));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::{str::FromStr, time::SystemTime};

    use super::*;
    use uuid::Uuid;


    struct Context {
        name: String,
        database: Database
    }

    impl Context {
        pub fn new() -> Self {
            let name = Uuid::new_v4().to_string();
            let mut database = Database::default();
            database.open(&name).unwrap_or_else(|err| panic!("Failed to open database: {err}."));
            Context { name, database }
        }
    }

    impl Drop for Context {
        fn drop(&mut self) {
            self.database.conn
                .take()
                .expect("No connection to database.")
                .close()
                .unwrap_or_else(|(_, err)| panic!("Failed to close {err}."));

            //std::fs::remove_file(format!("{}.db", &self.name))
            //    .unwrap_or_else(|err| panic!("Failed to delete database: {err}."))
        }
    }

    #[test]
    fn test() {
        let database = &Context::new().database;
        //let id = database.add_work("name", "chapter", "status", "r#type", "format", &[]).unwrap();
        //std::thread::sleep(std::time::Duration::from_secs(4));
        //database.update("works", "chapter", id, "12");
    }
}
