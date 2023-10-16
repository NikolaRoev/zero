use std::{collections::HashMap, sync::Mutex, path::Path};
use serde::{Serialize, Deserialize};



#[derive(Serialize, Deserialize, Default, Debug, Copy, Clone)]
pub struct WindowConfig {
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub maximized: bool
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct DatabaseConfig {
    last: Option<String>,
    recent: Vec<String>
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    windows: HashMap<String, WindowConfig>,
    database: DatabaseConfig,
}


pub const CONFIG_PATH: &str = "config.json";
static CONFIG: Mutex<Option<Config>> = Mutex::new(None);

impl Config {
    pub fn load(path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut guard = CONFIG.lock().unwrap();
    
        let path = Path::new(path);
        if path.try_exists()? {
            let data = std::fs::read_to_string(path)?;
            *guard = Some(serde_json::from_str(&data)?);
        }
        else {
            *guard = Some(Config::default());
        }
    
        Ok(())
    }
    
    pub fn save(path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let guard = CONFIG.lock().unwrap();
        let config = guard.as_ref().unwrap();

        Ok(std::fs::write(path, serde_json::to_string_pretty(config)?)?)
    }
    
    pub fn get_window(label: &str) -> Option<WindowConfig> {
        let guard = CONFIG.lock().unwrap();
        let config = guard.as_ref().unwrap();

        config.windows.get(label).copied()
    }

    pub fn set_window(label: &str, window: WindowConfig) {
        let mut guard = CONFIG.lock().unwrap();
        let config = guard.as_mut().unwrap();

        config.windows.insert(label.to_string(), window);
    }

    pub fn get_last_database() -> Option<String> {
        let guard = CONFIG.lock().unwrap();
        let config = guard.as_ref().unwrap();

        config.database.last.clone()
    }

    pub fn set_last_database(path: Option<String>) {
        let mut guard = CONFIG.lock().unwrap();
        let config = guard.as_mut().unwrap();

        config.database.last = path;
    }

    pub fn get_recent_databases() -> Vec<String> {
        let guard = CONFIG.lock().unwrap();
        let config = guard.as_ref().unwrap();

        config.database.recent.clone()
    }

    pub fn add_recent_database(path: String) {
        let mut guard = CONFIG.lock().unwrap();
        let config = guard.as_mut().unwrap();

        if let Some(index) = config.database.recent.iter().position(|item| *item == path) {
            config.database.recent.remove(index);
        }

        config.database.recent.insert(0, path);
    }

    pub fn remove_recent_database(path: String) -> Result<(), Box<dyn std::error::Error>> {
        let mut guard = CONFIG.lock().unwrap();
        let config = guard.as_mut().unwrap();

        if let Some(index) = config.database.recent.iter().position(|item| *item == path) {
            config.database.recent.remove(index);
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

        Config::load("test.json");
        Config::save("test.json");
    }
}
