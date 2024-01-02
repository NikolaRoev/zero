use std::path::{Path, PathBuf};
use serde::{Serialize, Deserialize};



#[derive(Serialize, Deserialize, Debug, Copy, Clone)]
pub enum WindowState {
    Center,
    None,
    Maximized
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub window_width: f64,
    pub window_height: f64,
    pub window_x: f64,
    pub window_y: f64,
    pub window_state: WindowState,
    pub last_database: Option<PathBuf>,
    pub recent_databases: Vec<PathBuf>
}


impl Default for Config {
    fn default() -> Self {
        Self {
            window_width: 1024.0,
            window_height: 576.0,
            window_x: 0.0,
            window_y: 0.0,
            window_state: WindowState::Center,
            last_database: Default::default(),
            recent_databases: Default::default()
        }
    }
}

impl Config {
    pub fn load(&mut self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let path = Path::new(path);
        if path.try_exists()? {
            let data = std::fs::read_to_string(path)?;
            *self = serde_json::from_str(&data)?;
        }
        Ok(())
    }
    
    pub fn save(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
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
        let path = format!("{}.json", Uuid::new_v4());

        config.window_width = 1000.0;
        config.save(&path)?;
        config.load(&path)?;

        assert_eq!(config.window_width, 1000.0);

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
