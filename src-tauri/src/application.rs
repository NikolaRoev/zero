use tauri::Manager;

use crate::{window::{save_config, Config, create_window}, database::Database, menu::create_main_menu};


pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = create_window(
        app,
        String::from("main"),
        String::from("index.html"),
        String::from("zero"),
        1024.0,
        576.0,
        Some(create_main_menu())
    )?;

    let _ = tauri::WindowBuilder::new(app, "tre", tauri::WindowUrl::App("test.html".into()))
        .build()?;

    let mut database = Database::default();
    database.open("database.db")?;
    app.manage(database);

    Ok(())
}

pub fn callback(app_handle: &tauri::AppHandle, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
          log::debug!("exit req");
        },
        tauri::RunEvent::Exit => log::debug!("exit"),
        _ => {}
    }
}
