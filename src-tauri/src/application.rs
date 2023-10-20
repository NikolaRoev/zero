use std::sync::Mutex;
use tauri::Manager;

use crate::{config::Config, menu::set_recent_menu};



pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = crate::config::Config::default();
    if let Err(err) = config.load(crate::config::CONFIG_PATH) {
        log::error!("Failed to load config: {err}.");
    }

    let window = crate::window::create_window(
        &app.app_handle(),
        String::from("main"),
        String::from("index.html"),
        String::from("zero"),
        config.get_window("main"),
        (1024.0, 576.0),
        Some(crate::menu::create_main_menu())
    )?;

    set_recent_menu(window.menu_handle(), config.get_recent_databases())?;

    let mut database = crate::database::Database::default();
    if let Some(last) = config.get_last_database() {
        database.open(last)?;
    }

    app.manage(Mutex::new(config));
    app.manage(Mutex::new(database));

    Ok(())
}

pub fn callback(app: &tauri::AppHandle, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { .. } => {
            let config_state = app.state::<Mutex<Config>>();
            let config = config_state.lock().unwrap();
            if let Err(err) = config.save(crate::config::CONFIG_PATH) {
                log::error!("Failed to save config: {err}.");
            }
        },
        tauri::RunEvent::Exit => log::info!("Exited zero."),
        _ => {}
    }
}
