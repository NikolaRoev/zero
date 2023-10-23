use std::sync::Mutex;

use crate::config::Config;
use serde::{Serialize, Deserialize};
use tauri::{Manager, PhysicalSize};


#[derive(Serialize, Deserialize, Default, Debug, Copy, Clone)]
pub struct WindowConfig {
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub maximized: bool
}


pub fn create_window(
    manager: &tauri::AppHandle,
    label: String,
    url: String,
    title: String,
    config: Option<&WindowConfig>,
    default_size: (f64, f64),
    menu: Option<tauri::Menu>
) -> Result<tauri::Window, Box<dyn std::error::Error>> {
    let mut builder = tauri::WindowBuilder::new(manager, &label, tauri::WindowUrl::App(url.into()))
        .title(title);

    if let Some(config) = config {
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
        let (width, height) = default_size;
        builder = builder.inner_size(width, height).center();
    }

    if let Some(menu) = menu {
        builder = builder.menu(menu);
    }

    Ok(builder.build()?)
}

pub fn event_handler(event: tauri::GlobalWindowEvent) {
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
            config.set_window(window.label(), WindowConfig {
                width: size.width,
                height: size.height + window.menu_handle().is_visible().map(|visible| if visible { 20.0 } else { 0.0 }).unwrap(),
                x: position.x,
                y: position.y,
                maximized: window.is_maximized().unwrap()
            });
        }

        if window.label() == "main" {
            let mut all = window.app_handle().windows();
            all.remove("main");
            for window in all.values(){
                //FIXME: This will call all other close requested in 2.0.
                window.close().unwrap()
            }
        }
    }
}
