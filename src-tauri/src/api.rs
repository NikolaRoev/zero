use std::{sync::Mutex, ffi::OsString, path::PathBuf};

use tauri::Manager;

use crate::{database::Database, error::ZeroError, menu::set_recent_menu, config::Config};



#[tauri::command]
pub fn open_database(
    app_handle: tauri::AppHandle,
    config: tauri::State<Mutex<Config>>,
    database: tauri::State<Mutex<Database>>,
    path: PathBuf
) -> Result<(), String> {
    log::info!("Opening database: PATH - {path:?}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let mut db_guard = database.lock().unwrap();
        db_guard.open(&path)?;

        let mut config_guard = config.lock().unwrap();
        config_guard.set_last_database(Some(path.clone()));
        config_guard.add_recent_database(path);

        let window = app_handle.get_window("main").unwrap();
        set_recent_menu(window.menu_handle(), config_guard.get_recent_databases())
    };

    match inner() {
        Ok(()) => {
            log::info!("Opened database.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to open database: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn close_database(
    database: tauri::State<Mutex<Database>>,
) -> Result<(), String> {
    log::info!("Closing database.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let mut db_guard = database.lock().unwrap();
        db_guard.close()
    };

    match inner() {
        Ok(()) => {
            log::info!("Closed database.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to close database: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_creator(database: tauri::State<Mutex<Database>>, name: String, works: Vec<i64>) -> Result<i64, String> {
    log::info!("Adding creator: NAME - {name}, WORKS - {works:?}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        let creator_id = guard.add("creators", vec![("name", &name)])?;
        works.iter().try_for_each(|work_id| guard.attach(*work_id, creator_id))?;
        Ok(creator_id)
    };

    match inner() {
        Ok(id) => {
            log::info!("Added creator: ID - {id}.");
            Ok(id)
        },
        Err(err) => {
            let message = format!("Failed to add creator: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}
