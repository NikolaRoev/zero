use std::{path::PathBuf, sync::Mutex};
use tauri::Manager;

use crate::{config::Config, menu::{set_menu_state, set_recent_menu}};



pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = crate::config::Config::default();
    if let Err(err) = config.load(PathBuf::from("config.json")) {
        log::error!("Failed to load config: {err}.");
    }

    let binding = app.app_handle();
    let window = tauri::WindowBuilder::new(
        &binding,
        "main", tauri::WindowUrl::App("index.html".into()))
        .title("zero")
        .menu(crate::menu::create_main_menu())
        .visible(false)
        .build().unwrap();

    //TODO: rework the whole menu stuff when we can set a menu a to window in 2.0.

    let menu_handle = window.menu_handle();
    
    let mut database = crate::database::Database::default();
    if let Some(ref last) = config.last_database {
        log::info!("Opening last database: {last:?}");
        database.open(last)?;
        window.set_title(&format!("zero - {}", last.display()))?;
        config.add_recent_database(last.clone());
        set_menu_state(&menu_handle, true)?;
    }
    else {
        set_menu_state(&menu_handle, false)?;
    }

    set_recent_menu(&menu_handle, &config.recent_databases)?;

    
    app.manage(Mutex::new(config));
    app.manage(Mutex::new(database));

    Ok(())
}

pub fn callback(app: &tauri::AppHandle, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { .. } => {
            let config_state = app.state::<Mutex<Config>>();
            let config = config_state.lock().unwrap();
            if let Err(err) = config.save(PathBuf::from("config.json")) {
                log::error!("Failed to save config: {err}.");
            }
        },
        tauri::RunEvent::Updater(event) => {
            log::debug!("{:?}", event);
        },
        tauri::RunEvent::Exit => log::info!("Exited zero."),
        _ => {}
    }
}
