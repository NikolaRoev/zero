use crate::database::Database;


#[derive(serde::Deserialize)]
struct Test{
    a: i64,
    b: Option<String>
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn greet(database: tauri::State<Database>, name: &str) -> String {
    let _ = database.add_creator("asdasd", &[]);
    format!("Hello, {}! You've been greeted from Rust!", name)
}
