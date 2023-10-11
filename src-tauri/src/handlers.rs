use tauri::Manager;

use crate::{window::{save_config, Config, create_window}, database::Database};


pub fn setup_handler(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = create_window(
        app,
        String::from("main"),
        String::from("index.html"),
        String::from("zero"),
        1024.0,
        576.0
    )?;

    let _ = tauri::WindowBuilder::new(app, "tre", tauri::WindowUrl::App("test.html".into()))
        .build()?;

    let mut database = Database::default();
    database.open("database")?;
    app.manage(database);

    Ok(())
}


pub fn menu_event_handler(event: tauri::WindowMenuEvent) {
    match event.menu_item_id() {
      "Learn More" => {
        // open in browser (requires the `shell-open-api` feature)
        //api::shell::open(&event.window().shell_scope(), "https://github.com/tauri-apps/tauri".to_string(), None).unwrap();
      }
      id => {
        // do something with other events
        println!("got menu event: {}", id);
      }
    }
}

pub fn window_event_handler(event: tauri::GlobalWindowEvent) {
    if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
        let window = event.window();
        let monitor = window.current_monitor().unwrap().unwrap();
        let scale = monitor.scale_factor();

        if !window.is_minimized().unwrap() {
            let size = window.inner_size().unwrap().to_logical::<f64>(scale);
            let position =  window.outer_position().unwrap().to_logical::<f64>(scale);
            let _ = save_config(window.label().to_string(), Config {
                width: size.width,
                height: size.height,
                x: position.x,
                y: position.y,
                maximized: window.is_maximized().unwrap(),
            });
        }

        //TODO: save state

        if window.label() == "main" {
            let mut all = window.app_handle().windows();
            all.remove("main");
            for window in all.values(){
                //save state
                window.close().unwrap()
            }
        }
    }
}

pub fn run_event_handler(app_handle: &tauri::AppHandle, event: tauri::RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
          log::debug!("exit req");
        },
        tauri::RunEvent::Exit => log::debug!("exit"),
        _ => {}
    }
}
