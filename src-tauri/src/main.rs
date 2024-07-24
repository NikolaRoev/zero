#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod application;
mod config;
mod database;
mod event;
mod menu;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().targets([
            tauri_plugin_log::LogTarget::Stdout,
            if cfg!(dev) || cfg!(feature = "zero-test") {
                tauri_plugin_log::LogTarget::Folder(std::env::current_dir().unwrap_or_default())
            }
            else {
                tauri_plugin_log::LogTarget::LogDir
            }
        ]).format(|format, args, record| {
            let (start, end) = match record.level() {
                log::Level::Error => ("\x1b[91m", "\x1b[0m"),
                log::Level::Warn => ("\x1b[93m", "\x1b[0m"),
                log::Level::Info => ("\x1b[92m", "\x1b[0m"),
                log::Level::Debug => ("\x1b[95m", "\x1b[0m"),
                log::Level::Trace => ("\x1b[94m", "\x1b[0m"),
            };

            format.finish(format_args!("{start}[{now}][{level}][{target}/{line}]: {args}{end}",
                start = start,
                now = chrono::Local::now().format("%F][%T%.9f"),
                level = record.level(),
                target = record.target(),
                line = record.line().unwrap_or(0),
                args = args,
                end = end
            ))
        }).build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            tauri::Manager::get_window(app, "main").map(|window| window.set_focus());
        }))
        .setup(application::setup)
        .invoke_handler(tauri::generate_handler![
            api::open_database,
            api::close_database,
            api::database_path,
            api::get_works,
            api::get_creators,
            api::update_work_name,
            api::update_work_progress,
            api::update_work_status,
            api::update_work_type,
            api::update_work_format,
            api::update_creator_name,
            api::add_work,
            api::add_creator,
            api::add_status,
            api::get_statuses,
            api::update_status_name,
            api::update_status_is_update,
            api::reorder_statuses,
            api::remove_work,
            api::remove_creator,
            api::remove_status,
            api::add_type,
            api::get_types,
            api::remove_type,
            api::update_type_name,
            api::reorder_types,
            api::add_format,
            api::get_formats,
            api::remove_format,
            api::update_format_name,
            api::reorder_formats,
            api::attach,
            api::detach,
            api::get_recent_databases,
            api::remove_recent_database
        ])
        .on_menu_event(menu::event_handler)
        .build(tauri::generate_context!()).unwrap_or_else(|err| panic!("Failed to build application: {err}."))
        .run(application::callback);
}
