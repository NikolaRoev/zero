#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

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
fn greet(name: Test) -> String {
    format!("Hello, {}! You've been greeted from Rust! {}", name.b.unwrap_or("default".to_string()), name.a)
}

fn main() {
    log::init().unwrap_or_else(|err| panic!("Failed to init log: {err}."));

    
    let mut database = Database::default();
    database.open("database.db").unwrap_or_else(|err| panic!("Failed to open database: {err}."));

    

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
