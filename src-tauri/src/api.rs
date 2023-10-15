use crate::{database::Database, error::ZeroError};



#[tauri::command]
pub fn add_creator(database: tauri::State<Database>, name: String, works: Vec<i64>) -> Result<i64, ZeroError> {
    log::info!("Adding creator: NAME - {name}, WORKS - {works:?}.");

    let creator_id = database.add("creators", vec![("name", &name)])?;
    works.iter().try_for_each(|work_id| database.attach(*work_id, creator_id))?;

    Ok(creator_id)
}
