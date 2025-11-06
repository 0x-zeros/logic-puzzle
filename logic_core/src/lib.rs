//! 逻辑拼图核心库
//!
//! 提供棋盘、方块、求解器和生成器的核心实现

pub mod types;
pub mod board;
pub mod piece;
pub mod solver;
pub mod generator;

// WASM绑定（仅在编译为WASM时包含）
#[cfg(target_arch = "wasm32")]
pub mod wasm;

// 重新导出常用类型
pub use types::{Board, Piece, GameState, Color, Difficulty, Solution, Placement, SolveResult};
pub use solver::Solver;
pub use generator::Generator;

/// 棋盘大小常量
pub const BOARD_SIZE: usize = 8;
pub const TOTAL_CELLS: usize = BOARD_SIZE * BOARD_SIZE;

/// 障碍块数量
pub const OBSTACLE_COUNT: usize = 3;

/// 总方块数量
pub const TOTAL_PIECES: usize = 11;
