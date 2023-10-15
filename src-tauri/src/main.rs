#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod application;
mod database;
mod error;
mod log;
mod menu;
mod window;

fn main() {
    log::init().unwrap_or_else(|err| panic!("Failed to initialize log: {err}."));
    log::info!("Started zero.");

    tauri::Builder::default()
        .setup(application::setup)
        .invoke_handler(tauri::generate_handler![
            api::add_creator
        ])
        .on_menu_event(menu::event_handler)
        .on_window_event(window::event_handler)
        .build(tauri::generate_context!()).unwrap_or_else(|err| panic!("Failed to build application: {err}."))
        .run(application::callback);
}
