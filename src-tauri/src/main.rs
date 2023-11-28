#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod application;
mod config;
mod database;
mod log;
mod menu;

fn main() {
    log::init().unwrap_or_else(|err| panic!("Failed to initialize log: {err}."));

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            tauri::Manager::get_window(app, "main").map(|window| window.set_focus());
        }))
        .setup(application::setup)
        .invoke_handler(tauri::generate_handler![
            api::info,
            api::error,
            api::open_database,
            api::database_is_open,
            api::close_database,
            api::get_work,
            api::get_works,
            api::get_update_works,
            api::get_work_creators,
            api::get_creator,
            api::get_creators,
            api::get_creator_works,
            api::update_work_name,
            api::update_work_progress,
            api::add_work,
            api::add_creator,
            api::add_status,
            api::get_statuses,
            api::update_status,
            api::remove_status,
            api::add_type,
            api::get_types,
            api::remove_type,
            api::add_format,
            api::get_formats,
            api::remove_format,
            api::attach,
            api::detach,
            api::get_recent_databases,
            api::remove_recent_database
        ])
        .on_menu_event(menu::event_handler)
        .on_window_event(application::window_event_handler)
        .build(tauri::generate_context!()).unwrap_or_else(|err| panic!("Failed to build application: {err}."))
        .run(application::callback);
}
