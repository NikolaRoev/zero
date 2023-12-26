use std::path::{Path, PathBuf};
use serde::{Serialize, Deserialize};



#[derive(Serialize, Deserialize, Debug, Copy, Clone)]
pub struct WindowConfig {
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub maximized: bool
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    window_config: Option<WindowConfig>,
    database_last: Option<PathBuf>,
    database_recent: Vec<PathBuf>
}


pub const CONFIG_PATH: &str = "config.json";


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
    
    pub fn get_window_config(&self) -> Option<WindowConfig> {
        self.window_config
    }

    pub fn set_window_config(&mut self, window_config: WindowConfig) {
        self.window_config = Some(window_config);
    }

    pub fn get_last_database(&self) -> Option<&PathBuf> {
        self.database_last.as_ref()
    }

    pub fn set_last_database(&mut self, path: Option<PathBuf>) {
        self.database_last = path;
    }

    pub fn get_recent_databases(&self) -> &Vec<PathBuf> {
        &self.database_recent
    }

    pub fn add_recent_database(&mut self, path: PathBuf) {
        if let Some(index) = self.database_recent.iter().position(|item| *item == path) {
            self.database_recent.remove(index);
        }
        self.database_recent.insert(0, path);
    }

    pub fn remove_recent_database(&mut self, path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(index) = self.database_recent.iter().position(|item| item == path) {
            self.database_recent.remove(index);
            Ok(())
        }
        else {
            Err(format!("Recent database '{path:?}' did not exist").into())
        }
    }

    pub fn clear_recent_databases(&mut self) {
        self.database_recent.clear();
    }
}




#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    struct Context {
        name: String,
        config: Config
    }

    impl Context {
        pub fn new() -> Self {
            let name = format!("{}.json", Uuid::new_v4());
            Context { name, config: Config::default() }
        }
    }

    impl Drop for Context {
        fn drop(&mut self) {
            //std::fs::remove_file(format!("{}.db", &self.name))
            //    .unwrap_or_else(|err| panic!("Failed to delete database: {err}."))
        }
    }

    #[test]
    fn test() {
        let config = &Context::new().config;

        //Config::load("test.json");
        //Config::save("test.json");
    }
}
