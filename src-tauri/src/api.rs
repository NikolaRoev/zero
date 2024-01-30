use std::{sync::Mutex, path::PathBuf};
use crate::{database::{Database, Status, Type, Format, Work, Creator}, menu::{set_recent_menu, set_menu_state}, config::Config};



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
        config_guard.last_database = Some(path.to_path_buf());
        config_guard.add_recent_database(path.clone());

        window.emit(crate::event::CHANGE_RECENT_DATABASES_EVENT, ()).unwrap();

        let menu_handle = window.menu_handle();
        set_recent_menu(&menu_handle, &config_guard.recent_databases)?;
        set_menu_state(&menu_handle, true)?;

        Ok(window.emit(crate::event::OPENED_DATABASE_EVENT, path)?)
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
    window: tauri::Window,
    config: tauri::State<Mutex<Config>>,
    database: tauri::State<Mutex<Database>>,
) -> Result<(), String> {
    log::info!("Closing database.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let mut db_guard = database.lock().unwrap();
        db_guard.close()?;

        let mut config_guard = config.lock().unwrap();
        config_guard.last_database = None;

        set_menu_state(&window.menu_handle(), false)?;

        Ok(window.emit(crate::event::CLOSED_DATABASE_EVENT, ())?)
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
pub fn get_works(database: tauri::State<Mutex<Database>>) -> Result<Vec<Work>, String> {
    log::info!("Getting works.");

    let inner = || -> Result<Vec<Work>, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.get_works()
    };

    match inner() {
        Ok(works) => {
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
pub fn update_work_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating work [{id}]: NAME - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", &id, vec![("name", &name)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work [{id}] name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_progress(
    database: tauri::State<Mutex<Database>>,
    id: i64, progress:
    String, timestamp: i64
) -> Result<(), String> {
    log::info!("Updating work [{id}]: PROGRESS - {progress}, TIMESTAMP - {timestamp}.");
    

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", &id, vec![("progress", &progress), ("updated", &timestamp)])?;
        Ok(())
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work [{id}] progress: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_status(
    database: tauri::State<Mutex<Database>>,
    id: i64,
    status: i64,
    timestamp: i64
) -> Result<(), String> {
    log::info!("Updating work [{id}]: STATUS - {status}, TIMESTAMP - {timestamp}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", &id, vec![("status", &status), ("updated", &timestamp)])?;
        Ok(())
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work [{id}] status: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_type(database: tauri::State<Mutex<Database>>, id: i64, r#type: i64) -> Result<(), String> {
    log::info!("Updating work [{id}]: TYPE - {}.", r#type);

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", &id, vec![("type", &r#type)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work [{id}] type: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_work_format(database: tauri::State<Mutex<Database>>, id: i64, format: i64) -> Result<(), String> {
    log::info!("Updating work [{id}]: FORMAT - {}.", format);

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("works", &id, vec![("format", &format)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update work [{id}] format: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_creator_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating creator [{id}]: NAME - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("creators", &id, vec![("name", &name)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update creator [{id}] name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_work(database: tauri::State<Mutex<Database>>, work: Work) -> Result<i64, String> {
    log::info!("Adding work: WORK - {work:?}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        let work_id = guard.add(
            "works",
            vec![
                ("name", &work.name),
                ("progress", &work.progress),
                ("status", &work.status),
                ("type", &work.r#type),
                ("format", &work.format),
                ("updated", &work.updated),
                ("added", &work.added)
            ]
        )?;
        work.creators.iter().try_for_each(|creator_id| guard.attach(work_id, *creator_id))?;
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
pub fn add_creator(database: tauri::State<Mutex<Database>>, creator: Creator) -> Result<i64, String> {
    log::info!("Adding creator: CREATOR - {creator:?}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        let creator_id = guard.add("creators", vec![("name", &creator.name)])?;
        creator.works.iter().try_for_each(|work_id| guard.attach(*work_id, creator_id))?;
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
pub fn add_status(database: tauri::State<Mutex<Database>>, name: String) -> Result<i64, String> {
    log::info!("Adding status: {name}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("statuses", vec![("name", &name)])
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
pub fn update_status_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating status [{id}]: NAME - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("statuses", &id, vec![("name", &name)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update status [{id}] name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_status_is_update(database: tauri::State<Mutex<Database>>, id: i64, is_update: bool) -> Result<(), String> {
    log::info!("Updating status [{id}]: IS_UPDATE - {is_update}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("statuses", &id, vec![("is_update", &is_update)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update status [{id}] is_update: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_work(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing work [{id}].");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("works", id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove work [{id}]: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_creator(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing creator [{id}].");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("creators", id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove creator [{id}]: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn remove_status(database: tauri::State<Mutex<Database>>, id: i64) -> Result<(), String> {
    log::info!("Removing status [{id}].");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("statuses", id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove status [{id}]: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_type(database: tauri::State<Mutex<Database>>, name: String) -> Result<i64, String> {
    log::info!("Adding type: {name}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("types", vec![("name", &name)])
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
    log::info!("Removing type [{id}].");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("types", id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove type [{id}]: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_type_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating type [{id}]: NAME - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("types", &id, vec![("name", &name)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update type [{id}] name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn add_format(database: tauri::State<Mutex<Database>>, name: String) -> Result<i64, String> {
    log::info!("Adding format: {name}.");

    let inner = || -> Result<i64, Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.add("formats", vec![("name", &name)])
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
    log::info!("Removing format [{id}].");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.remove("formats", id)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove format [{id}]: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn update_format_name(database: tauri::State<Mutex<Database>>, id: i64, name: String) -> Result<(), String> {
    log::info!("Updating format [{id}]: NAME - {name}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let guard = database.lock().unwrap();
        guard.update("formats", &id, vec![("name", &name)])
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to update format [{id}] name: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}

#[tauri::command]
pub fn attach(database: tauri::State<Mutex<Database>>, work_id: i64, creator_id: i64) -> Result<(), String> {
    log::info!("Attaching: WORK_ID - {work_id}, CREATOR_ID - {creator_id}.");

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
    log::info!("Detaching: WORK_ID - {work_id}, CREATOR_ID - {creator_id}.");

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
    guard.recent_databases.to_vec()
}

#[tauri::command]
pub fn remove_recent_database(window: tauri::Window, config: tauri::State<Mutex<Config>>, path: PathBuf) -> Result<(), String> {
    log::info!("Removing recent database: PATH - {path:?}.");

    let inner = || -> Result<(), Box<dyn std::error::Error>>  {
        let mut guard = config.lock().unwrap();
        guard.remove_recent_database(&path)?;

        window.emit(crate::event::CHANGE_RECENT_DATABASES_EVENT, ())?;

        let menu_handle = window.menu_handle();
        set_recent_menu(&menu_handle, &guard.recent_databases)
    };

    match inner() {
        Ok(()) => {
            Ok(())
        },
        Err(err) => {
            let message = format!("Failed to remove recent database: {err}.");
            log::error!("{message}");
            Err(message)
        }
    }
}
