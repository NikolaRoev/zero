use crate::config;
use tauri::Manager;



pub fn create_window(
    manager: &tauri::App,
    label: String,
    url: String,
    title: String,
    config: Option<config::WindowConfig>,
    default_size: (f64, f64),
    menu: Option<tauri::Menu>
) -> Result<tauri::Window, Box<dyn std::error::Error>> {
    let mut builder = tauri::WindowBuilder::new(manager, &label, tauri::WindowUrl::App(url.into()))
        .title(title);

    if let Some(config) = config {
        builder = builder
            .inner_size(config.width, config.height)
            .position(config.x, config.y)
            .maximized(config.maximized);
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
            let size = window.inner_size().unwrap().to_logical::<f64>(scale);
            let position =  window.outer_position().unwrap().to_logical::<f64>(scale);
            crate::config::Config::set_window(window.label(), config::WindowConfig {
                width: size.width,
                height: size.height,
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
