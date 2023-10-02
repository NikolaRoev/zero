#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod log;
mod database;

use database::Database;

#[derive(serde::Deserialize)]
struct Test{
    a: i64,
    b: Option<String>
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(database: tauri::State<Database>, name: &str) -> String {
    let _ = database.add_creator("asdasd", &[]);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    log::init().unwrap_or_else(|err| panic!("Failed to init log: {err}."));

    
    let mut database = Database::default();
    database.open("database.db").unwrap_or_else(|err| panic!("Failed to open database: {err}."));

    

    tauri::Builder::default()
        .manage(database)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
