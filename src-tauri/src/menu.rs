use std::path::PathBuf;
use std::sync::Mutex;

use tauri::api::dialog::{FileDialogBuilder, MessageDialogBuilder, MessageDialogButtons, MessageDialogKind};
use tauri::api::shell;
use tauri::{webview_version, VERSION, ClipboardManager};
use tauri::{CustomMenuItem, Menu, Submenu, Manager, window::MenuHandle};

use crate::api;
use crate::{config::Config, api::add_creator, database::Database};


pub const RECENT_MENU_ITEMS: [&str; 5] = ["1", "2", "3", "4", "5"];


pub fn create_main_menu() -> Menu {
    // File.
    let new = CustomMenuItem::new("new", "New...");
    let open = CustomMenuItem::new("open", "Open...");

    let mut recent_menu = Menu::new();
    for index in RECENT_MENU_ITEMS {
        recent_menu = recent_menu.add_item(CustomMenuItem::new(index, format!("{index}.")).disabled());
    }
    let more = CustomMenuItem::new("more", "More...");
    let clear = CustomMenuItem::new("clear", "Clear Recently Opened");
    recent_menu = recent_menu
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(more)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(clear);

    let recent = Submenu::new("Open Recent", recent_menu);

    let close = CustomMenuItem::new("close", "Close").disabled();
    let exit = CustomMenuItem::new("exit", "Exit").accelerator("Alt+F4");

    let file_menu = Menu::new()
        .add_item(new)
        .add_item(open)
        .add_submenu(recent)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(close)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(exit);
    let file_submenu = Submenu::new("File", file_menu);


    // Tools
    let settings = CustomMenuItem::new("settings", "Settings").disabled();

    let tools_menu = Menu::new()
        .add_item(settings);
    let tools_submenu = Submenu::new("Tools", tools_menu);


    // Help.
    let repository = CustomMenuItem::new("repository", "Repository");
    let dev_tools = CustomMenuItem::new("dev_tools", "Open Developer Tools").accelerator("Ctrl+Shift+I");
    let check_for_updates = CustomMenuItem::new("check_for_updates", "Check for Updates...");
    let about = CustomMenuItem::new("about", "About");

    let help_menu = Menu::new()
        .add_item(repository)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(dev_tools)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(check_for_updates)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(about);
    let help_submenu = Submenu::new("Help", help_menu);
        

    // Menu.
    Menu::new()
        .add_submenu(file_submenu)
        .add_submenu(tools_submenu)
        .add_submenu(help_submenu)
}

pub fn set_recent_menu(handle: &MenuHandle, recent_databases: &[PathBuf]) -> Result<(), Box<dyn std::error::Error>> {
    for (index, id) in RECENT_MENU_ITEMS.iter().enumerate() {
        let item = handle.get_item(id);

        if let Some(database) = recent_databases.get(index) {
            item.set_title(format!("{id}. {}", database.display()))?;
            item.set_enabled(true)?;
        }
        else {
            item.set_title(format!("{id}."))?;
            item.set_enabled(false)?;
        }
    }
    Ok(())
}

pub fn set_menu_state(handle: &MenuHandle, enabled: bool) -> Result<(), Box<dyn std::error::Error>> {
    handle.get_item("settings").set_enabled(enabled)?;
    handle.get_item("close").set_enabled(enabled)?;

    Ok(())
}

pub fn event_handler(event: tauri::WindowMenuEvent) {
    match event.menu_item_id() {
        "new" => {
            FileDialogBuilder::new()
                .set_title("New Database")
                .set_file_name("database")
                .add_filter("Database", &["db"])
                .save_file(move |path| {
                if let Some(path) = path {
                    let window = event.window();
                    let _ = api::open_database(
                        window.clone(),
                        window.state::<Mutex<Config>>(),
                        window.state::<Mutex<Database>>(),
                        path
                    );
                }
            });
        },
        "open" => {
            FileDialogBuilder::new()
                .set_title("Open Database")
                .add_filter("Database", &["db"])
                .pick_file(move |path| {
                if let Some(path) = path {
                    let window = event.window();
                    let _ = api::open_database(
                        window.clone(),
                        window.state::<Mutex<Config>>(),
                        window.state::<Mutex<Database>>(),
                        path
                    );
                }
            })
        },
        label if RECENT_MENU_ITEMS.contains(&label) => {
            let window = event.window();
            let index = RECENT_MENU_ITEMS.iter().position(|&item| item == label).unwrap();
            let config = window.state::<Mutex<Config>>();
            let guard = config.lock().unwrap();
            let recent = guard.get_recent_databases().get(index).unwrap().clone();
            drop(guard);

            let _ = api::open_database(
                window.clone(),
                window.state::<Mutex<Config>>(),
                window.state::<Mutex<Database>>(),
                recent
            );
        },
        "more" => {
            //TODO
        },
        "clear" => {
            let window = event.window();
            let state = window.state::<Mutex<Config>>();
            let mut config = state.lock().unwrap();
            config.clear_recent_databases();

            if let Err(err) = set_recent_menu(&window.menu_handle(), config.get_recent_databases()) {
                log::error!("Failed to set recent menu after clearing: {err}.");
            }
        },
        "close" => {
            let window = event.window();
            let _ = api::close_database(
                window.app_handle(),
                window.clone(),
                window.state::<Mutex<Config>>(),
                window.state::<Mutex<Database>>()
            );
        },
        "settings" => {
            crate::window::create_window(
                &event.window().app_handle(),
                String::from("settings"),
                String::from("settings.html"),
                String::from("Settings"),
                event.window().state::<Mutex<Config>>().lock().unwrap().get_window("settings"),
                (600.0, 400.0),
                None
            ).unwrap();
        },
        "exit" => {
            //FIXME: Does not trigger closerequested, will be fixed in 2.0.
            event.window().close().unwrap();            
        },
        "repository" => {
            if let Err(err) = shell::open(&event.window().shell_scope(), "https://github.com/NikolaRoev/zero", None) {
                log::error!("Failed to open repository: {err}.");
            }
            event.window().close_devtools();
        },
        "dev_tools" => event.window().open_devtools(),
        "check_for_updates" => {
            //TODO
        },
        "about" => {
            let handle = event.window().app_handle();

            let message = format!(
                "Version: {}\nTauri: {}\nWebView/WebKit: {}",
                handle.package_info().version,
                VERSION,
                webview_version().unwrap_or("UNKNOWN".to_string())
            );

            MessageDialogBuilder::new("zero", &message)
                .buttons(MessageDialogButtons::OkCancelWithLabels("Copy".to_string(), "Ok".to_string()))
                .kind(MessageDialogKind::Info)
                .show(move |result| {
                    if result {
                        if let Err(err) = handle.clipboard_manager().write_text(message) {
                            log::error!("Failed to set clipboard: {err}.");
                        }
                    }
                });
        },
        invalid => log::error!("Invalid menu event: '{invalid}'.")
    }
}
