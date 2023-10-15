use tauri::Manager;

pub struct Config {
    pub width: f64,
    pub height: f64,
    pub x: f64,
    pub y: f64,
    pub maximized: bool
}

fn load_config(label: &String) -> Result<Config, Box<dyn std::error::Error>> {
    let ini = ini::Ini::load_from_file("config.ini")?;
    let window_section = ini
        .section(Some(format!("window-{label}")))
        .ok_or(format!("No window section for '{label}'"))?;

    Ok(Config {
        width: window_section.get("width").ok_or("No 'width'")?.parse()?,
        height: window_section.get("height").ok_or("No 'height'")?.parse()?,
        x: window_section.get("x").ok_or("No 'x'")?.parse()?,
        y: window_section.get("y").ok_or("No 'y'")?.parse()?,
        maximized: window_section.get("maximized").ok_or("No 'maximized'")?.parse()?
    })
}

pub fn save_config(label: String, config: Config) -> Result<(), Box<dyn std::error::Error>> {
    let mut ini = ini::Ini::load_from_file("config.ini").unwrap_or_default();

    ini.with_section(Some(format!("window-{label}")))
        .set("width", config.width.to_string())
        .set("height", config.height.to_string())
        .set("x", config.x.to_string())
        .set("y", config.y.to_string())
        .set("maximized", config.maximized.to_string());
    ini.write_to_file("config.ini")?;
    Ok(())
}

pub fn create_window(
    manager: &tauri::App,
    label: String,
    url: String,
    title: String,
    default_width: f64,
    default_height: f64,
    menu: Option<tauri::Menu>
) -> Result<tauri::Window, Box<dyn std::error::Error>> {
    let mut builder = tauri::WindowBuilder::new(manager, &label, tauri::WindowUrl::App(url.into()))
        .title(title);

    match load_config(&label) {
        Ok(config) => {
            if config.maximized {
                builder = builder.maximized(config.maximized);
            }
            else {
                builder = builder.inner_size(config.width, config.height).position(config.x, config.y);
            }
        },
        Err(err) => {
            log::warn!("Failed to load config: {err}.");
            builder = builder.inner_size(default_width, default_height).center();
        }
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
