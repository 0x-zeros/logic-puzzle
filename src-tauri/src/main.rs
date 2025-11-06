// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            new_level,
            solve_level,
            check_placement,
            get_pieces,
            save_level,
            load_level,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
