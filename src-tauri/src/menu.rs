use tauri::{CustomMenuItem, Menu, Submenu, Manager};

pub fn create_main_menu() -> Menu {
    let one = CustomMenuItem::new("one", "one");
    let two = CustomMenuItem::new("two", "two");
    let test = Menu::new().add_item(one).add_item(two);

    // File.
    let open = CustomMenuItem::new("open", "Open Database...");
    let recent = Submenu::new("Open Recent", test);
    let close = CustomMenuItem::new("close", "Close Database");
    let quit = CustomMenuItem::new("exit", "Exit");

    let file_menu = Menu::new()
        .add_item(open)
        .add_submenu(recent)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(close)
        .add_native_item(tauri::MenuItem::Separator)
        .add_item(quit);
    let file_submenu = Submenu::new("File", file_menu);


    // Tools
    let settings = CustomMenuItem::new("settings", "Settings");

    let tools_menu = Menu::new()
        .add_item(settings);
    let tools_submenu = Submenu::new("Tools", tools_menu);


    // Help.
    let repository = CustomMenuItem::new("repository", "Repository");
    let dev_tools = CustomMenuItem::new("dev_tools", "Toggle Developer Tools");
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

pub fn event_handler(event: tauri::WindowMenuEvent) {    
    match event.menu_item_id() {
      "exit" => {
        //FIXME: Does not trigger closerequested, will be fixed in 2.0.
        event.window().close().unwrap();
        // open in browser (requires the `shell-open-api` feature)
        tauri::api::shell::open(&event.window().shell_scope(), "https://github.com/tauri-apps/tauri", None).unwrap();
      }
      id => {
        // do something with other events
        println!("got menu event: {}", id);
      }
    }
}
