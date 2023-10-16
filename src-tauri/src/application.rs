use tauri::Manager;



pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    crate::config::Config::load(crate::config::CONFIG_PATH)?;

    crate::window::create_window(
        app,
        String::from("main"),
        String::from("index.html"),
        String::from("zero"),
        crate::config::Config::get_window("main"),
        (1024.0, 576.0),
        Some(crate::menu::create_main_menu())
    )?;

    crate::window::create_window(
        app,
        String::from("settings"),
        String::from("test.html"),
        String::from("Settings"),
        crate::config::Config::get_window("settings"),
        (600.0, 400.0),
        None
    )?;

    let mut database = crate::database::Database::default();
    if let Some(last) = crate::config::Config::get_last_database() {
        database.open(&last)?;
    }
    app.manage(database);

    Ok(())
}

pub fn callback(_: &tauri::AppHandle, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { .. } => {
            crate::config::Config::save(crate::config::CONFIG_PATH).unwrap();
        },
        tauri::RunEvent::Exit => log::info!("Exited zero."),
        _ => {}
    }
}
