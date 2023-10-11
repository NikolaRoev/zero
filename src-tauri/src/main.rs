#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod log;
mod database;
mod error;
mod window;
mod api;
mod menu;
mod handlers;

fn main() {
    log::init().unwrap_or_else(|err| panic!("Failed to initialize log: {err}."));
    log::info!("Started zero.");

    tauri::Builder::default()
        .setup(handlers::setup_handler)
        .invoke_handler(tauri::generate_handler![
            api::greet
        ])
        .on_menu_event(handlers::menu_event_handler)
        .on_window_event(handlers::window_event_handler)
        .build(tauri::generate_context!()).expect("Failed to build Tauri application.")
        .run(handlers::run_event_handler);
}
