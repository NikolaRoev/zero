use std::path::PathBuf;
use serde::{Serialize, Deserialize};



pub fn get_config_path(path_resolver: tauri::PathResolver) -> PathBuf {
    let local_path: PathBuf = PathBuf::from("config.json");

    if cfg!(dev) || cfg!(feature = "zero-test") {
        local_path
    }
    else {
        path_resolver.app_local_data_dir().unwrap_or_default().join(local_path)
    }
}



#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    pub last_database: Option<PathBuf>,
    pub recent_databases: Vec<PathBuf>
}

impl Config {
    pub fn load(&mut self, path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        if path.try_exists()? {
            let data = std::fs::read_to_string(path)?;
            *self = serde_json::from_str(&data)?;
        }
        Ok(())
    }
    
    pub fn save(&self, path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        Ok(std::fs::write(path, serde_json::to_string_pretty(self)?)?)
    }

    pub fn add_recent_database(&mut self, path: PathBuf) {
        if let Some(index) = self.recent_databases.iter().position(|item| *item == path) {
            self.recent_databases.remove(index);
        }
        self.recent_databases.insert(0, path);
    }

    pub fn remove_recent_database(&mut self, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(index) = self.recent_databases.iter().position(|item| item == path) {
            self.recent_databases.remove(index);
            Ok(())
        }
        else {
            Err(format!("Recent database {path:?} does not exist").into())
        }
    }
}



#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;


    #[test]
    fn can_save_and_load_config() -> Result<(), Box<dyn std::error::Error>> {
        let mut config = Config::default();
        let path = PathBuf::from(format!("{}.json", Uuid::new_v4()));
        let last_database = PathBuf::from("path");

        config.last_database = Some(last_database.clone());
        config.save(path.clone())?;
        config.load(path.clone())?;

        assert_eq!(config.last_database, Some(last_database));

        Ok(std::fs::remove_file(path)?)
    }

    #[test]
    fn orders_latest_recent_database_first() {
        let mut config = Config::default();
        let path0 = PathBuf::from("path0");
        let path1 = PathBuf::from("path1");

        config.add_recent_database(path1.clone());
        config.add_recent_database(path0.clone());

        assert_eq!(config.recent_databases[0], path0);
        assert_eq!(config.recent_databases[1], path1);
    }

    #[test]
    fn does_not_duplicate_when_adding_the_same_recent_database() {
        let mut config = Config::default();
        let path = PathBuf::from("path");

        config.add_recent_database(path.clone());
        config.add_recent_database(path.clone());

        assert_eq!(config.recent_databases.len(), 1);
        assert_eq!(config.recent_databases[0], path);
    }

    #[test]
    fn can_remove_recent_database() -> Result<(), Box<dyn std::error::Error>> {
        let mut config = Config::default();
        let path = PathBuf::from("path");

        config.add_recent_database(path.clone());

        assert_eq!(config.recent_databases[0], path);

        config.remove_recent_database(&path)?;

        assert_eq!(config.recent_databases.len(), 0);

        Ok(())
    }

    #[test]
    fn catches_invalid_recent_database_being_removed() -> Result<(), Box<dyn std::error::Error>> {
        let mut config = Config::default();
        let path = PathBuf::from("path");

        let error_message = config.remove_recent_database(&path).unwrap_err().to_string();

        assert_eq!(error_message, "Recent database \"path\" does not exist");

        Ok(())
    }
}
