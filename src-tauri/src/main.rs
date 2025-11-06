// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            new_level,
            solve_level,
            check_placement,
            get_pieces,
            validate_custom_obstacles,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
