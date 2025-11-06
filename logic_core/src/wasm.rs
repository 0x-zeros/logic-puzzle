//! WASM绑定层 - 导出API供JavaScript调用

use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::{from_value, to_value};
use crate::{
    Difficulty, GameState, Generator, Solver, piece::get_standard_pieces,
    Board, Piece, SolveResult,
};

/// 初始化WASM模块
#[wasm_bindgen(start)]
pub fn init() {
    // 设置panic hook，在浏览器控制台显示更好的错误信息
    console_error_panic_hook::set_once();
}

/// WASM拼图游戏主结构
#[wasm_bindgen]
pub struct WasmPuzzle {
    generator: Generator,
}

#[wasm_bindgen]
impl WasmPuzzle {
    /// 创建新的WASM拼图实例
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            generator: Generator::new(),
        }
    }

    /// 生成新关卡
    #[wasm_bindgen(js_name = newLevel)]
    pub fn new_level(&self, difficulty: &str) -> Result<JsValue, JsValue> {
        let diff = match difficulty {
            "easy" => Difficulty::Easy,
            "medium" => Difficulty::Medium,
            "hard" => Difficulty::Hard,
            _ => return Err(JsValue::from_str("Invalid difficulty")),
        };

        match self.generator.generate(diff) {
            Some(state) => to_value(&state).map_err(|e| JsValue::from_str(&e.to_string())),
            None => Err(JsValue::from_str("Failed to generate level")),
        }
    }

    /// 求解关卡
    #[wasm_bindgen(js_name = solveLevel)]
    pub fn solve_level(&self, state_js: JsValue) -> Result<JsValue, JsValue> {
        let state: GameState = from_value(state_js)
            .map_err(|e| JsValue::from_str(&format!("Parse error: {}", e)))?;

        let solver = Solver::new(1);
        let result = solver.solve(&state);

        // 转换为SolveResponse格式（与Tauri保持一致）
        #[derive(serde::Serialize)]
        struct SolveResponse {
            no_solution: bool,
            unique_solution: Option<crate::Solution>,
            multiple_solutions: Option<Vec<crate::Solution>>,
        }

        let response = match result {
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
        };

        to_value(&response).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// 检查是否可以放置方块
    #[wasm_bindgen(js_name = checkPlacement)]
    pub fn check_placement(
        &self,
        board_cells: Vec<i8>,
        piece_id: u8,
        row: usize,
        col: usize,
        rotated: bool,
    ) -> Result<bool, JsValue> {
        if board_cells.len() != 64 {
            return Err(JsValue::from_str("Invalid board size"));
        }

        let cells: [i8; 64] = board_cells
            .try_into()
            .map_err(|_| JsValue::from_str("Invalid board cells"))?;

        let board = Board::from_array(cells);

        let mut piece = get_standard_pieces()
            .into_iter()
            .find(|p| p.id == piece_id)
            .ok_or_else(|| JsValue::from_str("Invalid piece ID"))?;

        if rotated {
            piece.rotate();
        }

        Ok(board.can_place(&piece, row, col))
    }

    /// 获取所有标准方块
    #[wasm_bindgen(js_name = getPieces)]
    pub fn get_pieces(&self) -> Result<JsValue, JsValue> {
        to_value(&get_standard_pieces()).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// 验证自定义障碍配置
    #[wasm_bindgen(js_name = validateCustomObstacles)]
    pub fn validate_custom_obstacles(&self, board_cells: Vec<i8>) -> Result<JsValue, JsValue> {
        if board_cells.len() != 64 {
            return Err(JsValue::from_str("Invalid board size"));
        }

        let cells: [i8; 64] = board_cells
            .try_into()
            .map_err(|_| JsValue::from_str("Invalid board cells"))?;

        let board = Board::from_array(cells);

        // 找出障碍块ID（负数）
        let mut obstacle_ids: Vec<u8> = Vec::new();
        for &cell in board.cells() {
            if cell < 0 && cell >= -3 {
                let id = cell.abs() as u8;
                if !obstacle_ids.contains(&id) {
                    obstacle_ids.push(id);
                }
            }
        }

        // 获取剩余方块
        let remaining_pieces: Vec<Piece> = get_standard_pieces()
            .into_iter()
            .filter(|p| !obstacle_ids.contains(&p.id))
            .collect();

        let validation_board = board.clone();

        let state = GameState {
            board: validation_board,
            pieces: remaining_pieces.clone(),
            used_pieces: vec![false; remaining_pieces.len()],
            obstacle_positions: Vec::new(),
        };

        // 验证求解
        let solver = Solver::new(2);
        let result = solver.solve(&state);

        #[derive(serde::Serialize)]
        struct ValidationResult {
            has_unique_solution: bool,
            no_solution: bool,
            multiple_solutions: bool,
        }

        let validation = match result {
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
        };

        to_value(&validation).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
