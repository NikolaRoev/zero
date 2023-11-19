use std::{sync::Mutex, path::PathBuf, collections::HashMap};

use tauri::Manager;

use crate::{database::{Database, Status, Type, Format, Work, Filter, UpdateWork}, menu::{set_recent_menu, set_menu_state}, config::Config};


const OPENED_DATABASE_EVENT: &str = "opened-database";
const CLOSED_DATABASE_EVENT: &str = "closed-database";


#[tauri::command]
pub fn error(message: String) {
    log::error!("[UI] {}", message);
}

#[tauri::command]
pub fn open_database(
    window: tauri::Window,
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

        let menu_handle = window.menu_handle();
        set_recent_menu(&menu_handle, config_guard.get_recent_databases())?;
        set_menu_state(&menu_handle, true)?;

        Ok(window.emit(OPENED_DATABASE_EVENT, ())?)
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
pub fn database_is_open(database: tauri::State<Mutex<Database>>) -> bool {
    log::info!("Checking if database is open.");
    let db_guard = database.lock().unwrap();
    db_guard.is_open()
}

#[tauri::command]
pub fn close_database(
    app_handle: tauri::AppHandle,
    window: tauri::Window,
    config: tauri::State<Mutex<Config>>,
    database: tauri::State<Mutex<Database>>,
) -> Result<(), String> {
    log::info!("Closing database.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let mut db_guard = database.lock().unwrap();
        db_guard.close()?;

        let mut config_guard = config.lock().unwrap();
        config_guard.set_last_database(None);

        set_menu_state(&window.menu_handle(), false)?;

        Ok(app_handle.emit_all(CLOSED_DATABASE_EVENT, ())?)
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
pub fn get_works(database: tauri::State<Mutex<Database>>) -> Result<Vec<Work>, String> {
    log::info!("Getting works.");

    let inner = || -> Result<Vec<Work>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        let filter: Filter = Filter{
            by: "name".to_string(),
            value: "".to_string(),
            restrictions: HashMap::new()
        };
        guard.get_works(filter, None)
    };

    match inner() {
        Ok(works) => {
            //log::info!("Got update works: {update_works:?}.");
            Ok(works)
        },
        Err(err) => {
            let message = format!("Failed to get works: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_update_works(database: tauri::State<Mutex<Database>>, name: String) -> Result<Vec<UpdateWork>, String> {
    log::info!("Getting update works.");

    let inner = || -> Result<Vec<UpdateWork>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_update_works(name)
    };

    match inner() {
        Ok(update_works) => {
            //log::info!("Got update works: {update_works:?}.");
            Ok(update_works)
        },
        Err(err) => {
            let message = format!("Failed to get update works: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating work {id}: name - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", "name", id, &name)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_progress(database: tauri::State<Mutex<Database>>, id: i64, progress: String) -> Result<(), String> {
    log::info!("Updating work {id}: progress - {progress}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", "progress", id, &progress)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work progress: {err}.");
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

#[tauri::command]
pub fn add_status(database: tauri::State<Mutex<Database>>, status: String) -> Result<(), String> {
    log::info!("Adding status: {status}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("statuses", vec![("status", &status)])
    };

    match inner() {
        Ok(id) => {
            log::info!("Added status: ID - {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to add status: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_statuses(database: tauri::State<Mutex<Database>>) -> Result<Vec<Status>, String> {
    log::info!("Getting statuses.");

    let inner = || -> Result<Vec<Status>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_statuses()
    };

    match inner() {
        Ok(statuses) => {
            log::info!("Got statuses: {statuses:?}.");
            Ok(statuses)
        },
        Err(err) => {
            let message = format!("Failed to get statuses: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_status(database: tauri::State<Mutex<Database>>, id: i64, is_update: bool) -> Result<(), String> {
    log::info!("Updating status {id}: is_update - {is_update}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("statuses", "is_update", id, &is_update)
    };

    match inner() {
        Ok(()) => {
            log::info!("Updated status {id}: is_update - {is_update}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update status: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_status(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing status {id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("statuses", id)
    };

    match inner() {
        Ok(()) => {
            log::info!("Removed status {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove status: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_type(database: tauri::State<Mutex<Database>>, r#type: String) -> Result<(), String> {
    log::info!("Adding type: {}.", r#type);

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("types", vec![("type", &r#type)])
    };

    match inner() {
        Ok(id) => {
            log::info!("Added type: ID - {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to add type: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_types(database: tauri::State<Mutex<Database>>) -> Result<Vec<Type>, String> {
    log::info!("Getting types.");

    let inner = || -> Result<Vec<Type>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_types()
    };

    match inner() {
        Ok(types) => {
            log::info!("Got types: {types:?}.");
            Ok(types)
        },
        Err(err) => {
            let message = format!("Failed to get types: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_type(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing type {id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("types", id)
    };

    match inner() {
        Ok(()) => {
            log::info!("Removed type {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove type: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_format(database: tauri::State<Mutex<Database>>, format: String) -> Result<(), String> {
    log::info!("Adding format: {format}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("formats", vec![("format", &format)])
    };

    match inner() {
        Ok(id) => {
            log::info!("Added format: ID - {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to add format: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_formats(database: tauri::State<Mutex<Database>>) -> Result<Vec<Format>, String> {
    log::info!("Getting formats.");

    let inner = || -> Result<Vec<Format>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_formats()
    };

    match inner() {
        Ok(formats) => {
            log::info!("Got formats: {formats:?}.");
            Ok(formats)
        },
        Err(err) => {
            let message = format!("Failed to get formats: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_format(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing format {id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("formats", id)
    };

    match inner() {
        Ok(()) => {
            log::info!("Removed format {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove format: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}
