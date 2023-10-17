use std::{collections::HashMap, path::Path};
use serde::{Serialize, Deserialize};
use crate::window::WindowConfig;




#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    windows: HashMap<String, WindowConfig>,
    database_last: Option<String>,
    database_recent: Vec<String>
}

pub const CONFIG_PATH: &str = "config.json";


impl Config {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let path = Path::new(path);
        if path.try_exists()? {
            let data = std::fs::read_to_string(path)?;
            Ok(serde_json::from_str(&data)?)
        }
        else {
            Ok(Config::default())
        }
    }
    
    pub fn save(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        Ok(std::fs::write(path, serde_json::to_string_pretty(self)?)?)
    }
    
    pub fn get_window(&self, label: &str) -> Option<&WindowConfig> {
        self.windows.get(label)
    }

    pub fn set_window(&mut self, label: &str, window: WindowConfig) {
        self.windows.insert(label.to_string(), window);
    }

    pub fn get_last_database(&self) -> Option<&String> {
        self.database_last.as_ref()
    }

    pub fn set_last_database(&mut self, path: Option<String>) {
        self.database_last = path;
    }

    pub fn get_recent_databases(&self) -> &Vec<String> {
        &self.database_recent
    }

    pub fn add_recent_database(&mut self, path: String) {
        if let Some(index) = self.database_recent.iter().position(|item| *item == path) {
            self.database_recent.remove(index);
        }
        self.database_recent.insert(0, path);
    }

    pub fn remove_recent_database(&mut self, path: String) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(index) = self.database_recent.iter().position(|item| *item == path) {
            self.database_recent.remove(index);
            Ok(())
        }
        else {
            Err(format!("Recent database '{path}' did not exist").into())
        }
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
