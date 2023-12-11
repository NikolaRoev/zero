use std::{sync::Mutex, path::PathBuf};
use tauri::Manager;
use crate::{database::{Database, Status, Type, Format, Work, UpdateWork, Creator}, menu::{set_recent_menu, set_menu_state}, config::Config};


const OPENED_DATABASE_EVENT: &str = "opened-database";
const CLOSED_DATABASE_EVENT: &str = "closed-database";


#[tauri::command]
pub fn info(message: String) {
    log::info!("[UI] {}", message);
}

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
        config_guard.add_recent_database(path.clone());

        let menu_handle = window.menu_handle();
        set_recent_menu(&menu_handle, config_guard.get_recent_databases())?;
        set_menu_state(&menu_handle, true)?;

        Ok(window.emit(OPENED_DATABASE_EVENT, path)?)
    };

    match inner() {
        Ok(()) => {
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
pub fn database_path(database: tauri::State<Mutex<Database>>) -> Option<std::path::PathBuf> {
    log::info!("Getting current database path.");
    let guard = database.lock().unwrap();
    guard.path()
}

#[tauri::command]
pub fn get_work(database: tauri::State<Mutex<Database>>, id: i64) -> Result<Work, String> {
    log::info!("Getting work: ID - {id}.");

    let inner = || -> Result<Work, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_work(id)
    };

    match inner() {
        Ok(work) => {
            Ok(work)
        },
        Err(err) => {
            let message = format!("Failed to get work: {err}.");
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
        guard.get_works()
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
pub fn get_update_works(database: tauri::State<Mutex<Database>>) -> Result<Vec<UpdateWork>, String> {
    log::info!("Getting update works.");

    let inner = || -> Result<Vec<UpdateWork>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_update_works()
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
pub fn get_work_creators(database: tauri::State<Mutex<Database>>, work_id: i64) -> Result<Vec<Creator>, String> {
    log::info!("Getting work creators: ID - {work_id}.");

    let inner = || -> Result<Vec<Creator>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_work_creators(work_id)
    };

    match inner() {
        Ok(creators) => {
            Ok(creators)
        },
        Err(err) => {
            let message = format!("Failed to get work creators: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_creator(database: tauri::State<Mutex<Database>>, id: i64) -> Result<Creator, String> {
    log::info!("Getting creator: ID - {id}.");

    let inner = || -> Result<Creator, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_creator(id)
    };

    match inner() {
        Ok(creator) => {
            Ok(creator)
        },
        Err(err) => {
            let message = format!("Failed to get creator: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_creators(database: tauri::State<Mutex<Database>>) -> Result<Vec<Creator>, String> {
    log::info!("Getting creators.");

    let inner = || -> Result<Vec<Creator>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_creators()
    };

    match inner() {
        Ok(creators) => {
            Ok(creators)
        },
        Err(err) => {
            let message = format!("Failed to get creators: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_creator_works(database: tauri::State<Mutex<Database>>, creator_id: i64) -> Result<Vec<Work>, String> {
    log::info!("Getting creator works: ID - {creator_id}.");

    let inner = || -> Result<Vec<Work>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_creator_works(creator_id)
    };

    match inner() {
        Ok(works) => {
            Ok(works)
        },
        Err(err) => {
            let message = format!("Failed to get creator works: {err}.");
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
pub fn update_work_status(database: tauri::State<Mutex<Database>>, id: i64, status: String) -> Result<(), String> {
    log::info!("Updating work {id}: status - {status}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", "status", id, &status)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work status: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_type(database: tauri::State<Mutex<Database>>, id: i64, r#type: String) -> Result<(), String> {
    log::info!("Updating work {id}: type - {}.", r#type);

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", "type", id, &r#type)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work type: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_format(database: tauri::State<Mutex<Database>>, id: i64, format: String) -> Result<(), String> {
    log::info!("Updating work {id}: format - {}.", format);

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", "format", id, &format)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work format: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_creator_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating creator {id}: name - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("creators", "name", id, &name)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update creator name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_work(
    database: tauri::State<Mutex<Database>>,
    name: String,
    progress: String,
    status: String,
    r#type: String,
    format: String,
    creators: Vec<i64>
) -> Result<i64, String> {
    log::info!(
        "Adding work: NAME - {}, PROGRESS - {}, STATUS - {}, TYPE - {}, FORMAT - {} CREATORS - {:?}.",
        name, progress, status, r#type, format, creators
    );

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        let work_id = guard.add(
            "works",
            vec![
                ("name", &name),
                ("progress", &progress),
                ("status", &status),
                ("type", &r#type),
                ("format", &format)
            ]
        )?;
        creators.iter().try_for_each(|creator_id| guard.attach(work_id, *creator_id))?;
        Ok(work_id)
    };

    match inner() {
        Ok(id) => {
            log::info!("Added work: ID - {id}.");
            Ok(id)
        },
        Err(err) => {
            let message = format!("Failed to add work: {err}.");
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
pub fn add_status(database: tauri::State<Mutex<Database>>, status: String) -> Result<i64, String> {
    log::info!("Adding status: {status}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("statuses", vec![("status", &status)])
    };

    match inner() {
        Ok(id) => {
            log::info!("Added status: ID - {id}.");
            Ok(id)
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
pub fn remove_work(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing work {id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("works", id)
    };

    match inner() {
        Ok(()) => {
            log::info!("Removed work {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove work: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_creator(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing creator {id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("creators", id)
    };

    match inner() {
        Ok(()) => {
            log::info!("Removed creator {id}.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove creator: {err}.");
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
pub fn add_type(database: tauri::State<Mutex<Database>>, r#type: String) -> Result<i64, String> {
    log::info!("Adding type: {}.", r#type);

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("types", vec![("type", &r#type)])
    };

    match inner() {
        Ok(id) => {
            log::info!("Added type: ID - {id}.");
            Ok(id)
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
pub fn add_format(database: tauri::State<Mutex<Database>>, format: String) -> Result<i64, String> {
    log::info!("Adding format: {format}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("formats", vec![("format", &format)])
    };

    match inner() {
        Ok(id) => {
            log::info!("Added format: ID - {id}.");
            Ok(id)
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

#[tauri::command]
pub fn attach(database: tauri::State<Mutex<Database>>, work_id: i64, creator_id: i64) -> Result<(), String> {
    log::info!("Attaching: WORK_ID - {work_id} and CREATOR_ID - {creator_id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.attach(work_id, creator_id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to attach: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn detach(database: tauri::State<Mutex<Database>>, work_id: i64, creator_id: i64) -> Result<(), String> {
    log::info!("Detaching: WORK_ID - {work_id} and CREATOR_ID - {creator_id}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.detach(work_id, creator_id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to detach: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn get_recent_databases(config: tauri::State<Mutex<Config>>) -> Vec<PathBuf> {
    log::info!("Getting recent databases.");

    let guard = config.lock().unwrap();
    guard.get_recent_databases().to_vec()
}

#[tauri::command]
pub fn remove_recent_database(window: tauri::Window, config: tauri::State<Mutex<Config>>, path: PathBuf) -> Result<(), String> {
    log::info!("Removing recent database: PATH - {path:?}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let mut guard = config.lock().unwrap();
        guard.remove_recent_database(path)?;

        let menu_handle = window.menu_handle();
        set_recent_menu(&menu_handle, guard.get_recent_databases())
    };

    match inner() {
        Ok(()) => {
            log::info!("Removed recent database.");
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove recent database: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}
