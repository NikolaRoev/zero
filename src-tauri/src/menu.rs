use std::sync::Mutex;
use tauri::menu::{Menu, MenuBuilder, MenuId, MenuItemBuilder, SubmenuBuilder};
use tauri::{webview_version, Manager, Wry, VERSION};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use tauri_plugin_opener::OpenerExt;
use crate::api;
use crate::{config::Config, database::Database};



pub fn create_main_menu(app: &tauri::App) -> Result<tauri::menu::Menu<Wry>, Box<dyn std::error::Error>> {
    // Database.
    let new = MenuItemBuilder::with_id("new", "New...")
        .build(app)?;
    let open = MenuItemBuilder::with_id("open", "Open...")
        .build(app)?;
    let close = MenuItemBuilder::with_id("close", "Close")
        .enabled(false)
        .build(app)?;
    let exit = MenuItemBuilder::with_id("exit", "Exit")
        .accelerator("Alt+F4")
        .build(app)?;

    let database_menu = SubmenuBuilder::with_id(app, "database", "Database")
        .item(&new)
        .item(&open)
        .separator()
        .item(&close)
        .separator()
        .item(&exit)
        .build()?;


    // Help.
    let repository = MenuItemBuilder::with_id(
            "repository",
            "Repository"
        )
        .build(app)?;
    let dev_tools = MenuItemBuilder::with_id(
            "dev_tools",
            "Open Developer Tools"
        )
        .accelerator("Ctrl+Shift+I")
        .build(app)?;
    let about = MenuItemBuilder::with_id(
            "about",
            "About"
        )
        .build(app)?;

    let help_menu = SubmenuBuilder::new(app, "Help")
        .item(&repository)
        .separator()
        .item(&dev_tools)
        .separator()
        .item(&about)
        .build()?;

    // Menu.
    Ok(MenuBuilder::new(app)
        .item(&database_menu)
        .item(&help_menu)
        .build()?)
}


pub fn set_menu_state(
    handle: &Menu<Wry>,
    enabled: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    let item = handle.get(&MenuId::new("database")).unwrap();
    let item = item.as_submenu_unchecked();
    let item = item.get(&MenuId::new("close")).unwrap();
    let item = item.as_menuitem_unchecked();
    Ok(item.set_enabled(enabled)?)
}

pub fn event_handler(app: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        "new" => {
            let app_clone = app.clone();
            let window = app.get_webview_window("main").unwrap();

            app.dialog()
                .file()
                .set_title("New Database")
                .set_file_name("database")
                .add_filter("Database", &["db"])
                .save_file(move |path| {
                    if let Some(path) = path {
                        let _ = api::open_database(
                            app_clone.clone(),
                            window,
                            app_clone.state::<Mutex<Config>>(),
                            app_clone.state::<Mutex<Database>>(),
                            path.as_path().unwrap().to_path_buf(),
                        );
                    }
                });
        }
        "open" => {
            let app_clone = app.clone();
            let window = app.get_webview_window("main").unwrap();
            app.dialog()
                .file()
                .set_title("Open Database")
                .add_filter("Database", &["db"])
                .pick_file(move |path| {
                    if let Some(path) = path {
                        let _ = api::open_database(
                            app_clone.clone(),
                            window.clone(),
                            app_clone.state::<Mutex<Config>>(),
                            app_clone.state::<Mutex<Database>>(),
                            path.as_path().unwrap().to_path_buf(),
                        );
                    }
                })
        },
        "close" => {
            let app_clone = app.clone();
            let window = app.get_webview_window("main").unwrap();
            let _ = api::close_database(
                app_clone,
                window.clone(),
                app.state::<Mutex<Config>>(),
                app.state::<Mutex<Database>>(),
            );
        }
        "exit" => {
            app.get_webview_window("main").unwrap().close().unwrap();
        }
        "repository" => {
            if let Err(err) = app.opener().open_url("https://github.com/NikolaRoev/zero", None::<&str>) {
                log::error!("Failed to open repository: {err}.");
            }
        }
        "dev_tools" => app.get_webview_window("main").unwrap().open_devtools(),
        "about" => {
            let message = format!(
                "Version: {}\nTauri: {}\nWebView/WebKit: {}",
                app.package_info().version,
                VERSION,
                webview_version().unwrap_or("UNKNOWN".to_string())
            );

            let app_clone = app.clone();
            app.dialog().message(&message)
                .buttons(MessageDialogButtons::OkCancelCustom(
                    "Copy".to_string(),
                    "Ok".to_string(),
                ))
                .kind(MessageDialogKind::Info)
                .title("zero")
                .show(move |result| {
                    if result {
                        let clipboard = app_clone.clipboard();
                        if let Err(err) = clipboard.write_text(message) {
                            log::error!("Failed to set clipboard: {err}.");
                        }
                    }
                });
        }
        invalid => log::error!("Invalid menu event: '{invalid}'."),
    }
}
