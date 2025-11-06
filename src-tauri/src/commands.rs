//! Tauri命令接口

use logic_core::{
    Board, Difficulty, GameState, Generator, Piece, SolveResult, Solver,
    piece::get_standard_pieces,
};

/// 生成新关卡
#[tauri::command]
pub fn new_level(difficulty: String) -> Result<GameState, String> {
    let diff = match difficulty.as_str() {
        "easy" => Difficulty::Easy,
        "medium" => Difficulty::Medium,
        "hard" => Difficulty::Hard,
        _ => return Err("Invalid difficulty".to_string()),
    };

    let generator = Generator::new();
    generator
        .generate(diff)
        .ok_or_else(|| "Failed to generate level".to_string())
}

/// 求解当前关卡
#[tauri::command]
pub fn solve_level(state: GameState) -> Result<SolveResult, String> {
    let solver = Solver::new(1);
    Ok(solver.solve(&state))
}

/// 检查是否可以放置方块
#[tauri::command]
pub fn check_placement(
    board_cells: Vec<i8>,
    piece_id: u8,
    row: usize,
    col: usize,
    rotated: bool,
) -> Result<bool, String> {
    if board_cells.len() != 64 {
        return Err("Invalid board size".to_string());
    }

    let cells: [i8; 64] = board_cells
        .try_into()
        .map_err(|_| "Invalid board cells".to_string())?;

    let board = Board::from_array(cells);

    let mut piece = get_standard_pieces()
        .into_iter()
        .find(|p| p.id == piece_id)
        .ok_or_else(|| "Invalid piece ID".to_string())?;

    if rotated {
        piece.rotate();
    }

    Ok(board.can_place(&piece, row, col))
}

/// 获取所有标准方块
#[tauri::command]
pub fn get_pieces() -> Vec<Piece> {
    get_standard_pieces()
}

/// 保存关卡到文件
#[tauri::command]
pub fn save_level(state: GameState, path: String) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&state)
        .map_err(|e| format!("Serialization error: {}", e))?;

    std::fs::write(&path, json)
        .map_err(|e| format!("File write error: {}", e))?;

    Ok(())
}

/// 从文件加载关卡
#[tauri::command]
pub fn load_level(path: String) -> Result<GameState, String> {
    let json = std::fs::read_to_string(&path)
        .map_err(|e| format!("File read error: {}", e))?;

    serde_json::from_str(&json)
        .map_err(|e| format!("Deserialization error: {}", e))
}
