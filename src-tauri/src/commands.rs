//! Tauri命令接口

use logic_core::{
    Board, Difficulty, GameState, Generator, Piece, Solution, SolveResult, Solver,
    piece::get_standard_pieces,
};
use serde::Serialize;

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

/// 求解响应结构体
#[derive(Debug, Serialize)]
pub struct SolveResponse {
    pub no_solution: bool,
    pub unique_solution: Option<Solution>,
    pub multiple_solutions: Option<Vec<Solution>>,
}

/// 求解当前关卡
#[tauri::command]
pub fn solve_level(state: GameState) -> Result<SolveResponse, String> {
    eprintln!("=== Rust solve_level ===");
    eprintln!("board cells前10个: {:?}", &state.board.cells()[0..10]);
    eprintln!("pieces数量: {}", state.pieces.len());
    eprintln!("used_pieces数量: {}", state.used_pieces.len());
    eprintln!("used_pieces: {:?}", state.used_pieces);

    eprintln!("创建Solver...");
    let solver = Solver::new(1);

    eprintln!("开始求解...");
    let result = solver.solve(&state);

    eprintln!("求解完成，结果类型: {}", match &result {
        SolveResult::NoSolution => "NoSolution",
        SolveResult::UniqueSolution(_) => "UniqueSolution",
        SolveResult::MultipleSolutions(_) => "MultipleSolutions",
    });

    // 转换为结构体返回
    Ok(match result {
        SolveResult::NoSolution => SolveResponse {
            no_solution: true,
            unique_solution: None,
            multiple_solutions: None,
        },
        SolveResult::UniqueSolution(sol) => SolveResponse {
            no_solution: false,
            unique_solution: Some(sol),
            multiple_solutions: None,
        },
        SolveResult::MultipleSolutions(sols) => SolveResponse {
            no_solution: false,
            unique_solution: None,
            multiple_solutions: Some(sols),
        },
    })
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

/// 验证自定义障碍配置的结果
#[derive(Debug, Serialize)]
pub struct ValidationResult {
    pub has_unique_solution: bool,
    pub no_solution: bool,
    pub multiple_solutions: bool,
}

/// 验证自定义障碍配置是否有唯一解
#[tauri::command]
pub fn validate_custom_obstacles(
    board_cells: Vec<i8>,
) -> Result<ValidationResult, String> {
    if board_cells.len() != 64 {
        return Err("Invalid board size".to_string());
    }

    let cells: [i8; 64] = board_cells
        .try_into()
        .map_err(|_| "Invalid board cells".to_string())?;

    let board = Board::from_array(cells);

    eprintln!("=== validate_custom_obstacles ===");
    eprintln!("board cells前10个: {:?}", &board.cells()[0..10]);

    // 找出障碍块ID（棋盘上的负数 -1, -2, -3）
    let mut obstacle_ids: Vec<u8> = Vec::new();
    for &cell in board.cells() {
        if cell < 0 && cell >= -3 {
            let id = cell.abs() as u8;
            if !obstacle_ids.contains(&id) {
                obstacle_ids.push(id);
            }
        }
    }

    eprintln!("找到障碍块ID: {:?}", obstacle_ids);

    // 获取剩余方块（排除障碍块）
    let remaining_pieces: Vec<Piece> = get_standard_pieces()
        .into_iter()
        .filter(|p| !obstacle_ids.contains(&p.id))
        .collect();

    eprintln!("剩余方块数量: {}", remaining_pieces.len());

    // 障碍块已经是负数，直接使用
    let validation_board = board.clone();

    let state = GameState {
        board: validation_board,
        pieces: remaining_pieces.clone(),
        used_pieces: vec![false; remaining_pieces.len()],
        obstacle_positions: Vec::new(),
    };

    // 使用求解器验证（找2个解来判断唯一性）
    let solver = Solver::new(2);
    let result = solver.solve(&state);

    Ok(match result {
        SolveResult::NoSolution => ValidationResult {
            has_unique_solution: false,
            no_solution: true,
            multiple_solutions: false,
        },
        SolveResult::UniqueSolution(_) => ValidationResult {
            has_unique_solution: true,
            no_solution: false,
            multiple_solutions: false,
        },
        SolveResult::MultipleSolutions(_) => ValidationResult {
            has_unique_solution: false,
            no_solution: false,
            multiple_solutions: true,
        },
    })
}
