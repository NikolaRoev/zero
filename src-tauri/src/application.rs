use std::sync::Mutex;

use tauri::Manager;

use crate::config::Config;



pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let config = crate::config::Config::load(crate::config::CONFIG_PATH)?;

    crate::window::create_window(
        app,
        String::from("main"),
        String::from("index.html"),
        String::from("zero"),
        config.get_window("main"),
        (1024.0, 576.0),
        Some(crate::menu::create_main_menu(config.get_recent_databases()))
    )?;

    crate::window::create_window(
        app,
        String::from("settings"),
        String::from("test.html"),
        String::from("Settings"),
        config.get_window("settings"),
        (600.0, 400.0),
        None
    )?;

    let mut database = crate::database::Database::default();
    if let Some(last) = config.get_last_database() {
        database.open(last)?;
    }

    app.manage(Mutex::new(config));
    app.manage(database);

    Ok(())
}

pub fn callback(app: &tauri::AppHandle, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { .. } => {
            let config_state = app.state::<Mutex<Config>>();
            let config = config_state.lock().unwrap();
            config.save(crate::config::CONFIG_PATH).unwrap();
        },
        tauri::RunEvent::Exit => log::info!("Exited zero."),
        _ => {}
    }
}
