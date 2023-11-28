use std::sync::Mutex;
use tauri::Manager;

use crate::{config::Config, menu::{set_recent_menu, set_menu_state}, config::WindowConfig};



pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = crate::config::Config::default();
    if let Err(err) = config.load(crate::config::CONFIG_PATH) {
        log::error!("Failed to load config: {err}.");
    }

    let window_config = config.get_window_config();
    let binding = app.app_handle();
    let mut builder = tauri::WindowBuilder::new(
        &binding,
        "main", tauri::WindowUrl::App("index.html".into()))
        .title("zero");

    if let Some(config) = window_config {
        if config.maximized {
            builder = builder.maximized(config.maximized);
        }
        else {
            builder = builder
                .inner_size(config.width, config.height)
                .position(config.x, config.y);
        }
    }
    else {
        builder = builder.inner_size(1024.0, 576.0).center();
    }

    //TODO: rework the whole menu stuff when we can set a menu a to window in 2.0.
    let menu = crate::menu::create_main_menu();
    builder = builder.menu(menu);
    let window = builder.build().unwrap();


    let menu_handle = window.menu_handle();
    set_recent_menu(&menu_handle, config.get_recent_databases())?;

    let mut database = crate::database::Database::default();
    if let Some(last) = config.get_last_database() {
        database.open(last)?;
        set_menu_state(&menu_handle, true)?;
    }
    else {
        set_menu_state(&menu_handle, false)?;
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

pub fn window_event_handler(event: tauri::GlobalWindowEvent) {
    if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
        let window = event.window();
        let monitor = window.current_monitor().unwrap().unwrap();
        let scale = monitor.scale_factor();

        if !window.is_minimized().unwrap() {
            let size = window.inner_size().unwrap().to_logical(scale);
            let position =  window.outer_position().unwrap().to_logical(scale);

            let config_state = window.state::<Mutex<Config>>();
            let mut config = config_state.lock().unwrap();

            //FIXME: Accounts for the size of the menu.
            config.set_window_config(WindowConfig {
                width: size.width,
                height: size.height + 20.0,
                x: position.x,
                y: position.y,
                maximized: window.is_maximized().unwrap()
            });
        }
    }
}
