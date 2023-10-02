#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod log;
mod database;

use std::sync::Mutex;
use database::Database;

#[derive(serde::Deserialize)]
struct Test{
    a: i64,
    b: Option<String>
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(database: tauri::State<Mutex<Database>>, name: &str) -> String {
    let _ = database.lock().unwrap().add_creator("name", &[]);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    log::init().unwrap_or_else(|err| panic!("Failed to init log: {err}."));

    
    let database = Mutex::new(Database::default());
    database.lock().unwrap().open("database.db").unwrap_or_else(|err| panic!("Failed to open database: {err}."));

    

    tauri::Builder::default()
        .manage(database)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
