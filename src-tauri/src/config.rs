use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    pub last_database: Option<PathBuf>
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
}
