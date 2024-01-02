use std::sync::Mutex;
use tauri::Manager;

use crate::{config::{Config, WindowState}, menu::{set_recent_menu, set_menu_state}};



pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut config = crate::config::Config::default();
    if let Err(err) = config.load("config.json") {
        log::error!("Failed to load config: {err}.");
    }

    let binding = app.app_handle();
    let mut builder = tauri::WindowBuilder::new(
        &binding,
        "main", tauri::WindowUrl::App("index.html".into()))
        .title("zero");

    builder = builder.inner_size(config.window_width, config.window_height);

    match config.window_state {
        crate::config::WindowState::Center => builder = builder.center(),
        crate::config::WindowState::None => builder = builder.position(config.window_x, config.window_y),
        crate::config::WindowState::Maximized => builder = builder.maximized(true),
    }

    //TODO: rework the whole menu stuff when we can set a menu a to window in 2.0.
    let menu = crate::menu::create_main_menu();
    builder = builder.menu(menu);
    let window = builder.build().unwrap();


    let menu_handle = window.menu_handle();
    
    let mut database = crate::database::Database::default();
    if let Some(last) = &config.last_database {
        log::info!("Opening last database: {last:?}");
        database.open(last)?;
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
            if let Err(err) = config.save("config.json") {
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

pub fn window_event_handler(event: tauri::GlobalWindowEvent) {
    if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
        let window = event.window();
        
        if !window.is_minimized().unwrap() {
            let config_state = window.state::<Mutex<Config>>();
            let mut config = config_state.lock().unwrap();

            if !window.is_maximized().unwrap() {
                let scale = window.current_monitor().unwrap().unwrap().scale_factor();
                let size = window.inner_size().unwrap().to_logical(scale);
                let position =  window.outer_position().unwrap().to_logical(scale);

                config.window_width = size.width;
                config.window_height = size.height + 20.0; //FIXME: Accounts for the size of the menu.
                config.window_x = position.x;
                config.window_y = position.y;
                config.window_state = WindowState::None;   
            }
            else {
                config.window_state = WindowState::Maximized;
            }
        }
    }
}
