//! 核心数据类型定义

use serde::{Deserialize, Serialize};
use crate::{BOARD_SIZE, TOTAL_CELLS};

/// 方块颜色（每个方块独立颜色，同色系内有深浅区分）
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Color {
    // 黑色系 (1×1, 1×2, 1×3) - 从深到浅
    Black1,  // 深墨黑 - 1×1
    Black2,  // 标准黑 - 1×2
    Black3,  // 浅炭黑 - 1×3

    // 蓝色系 (1×4, 1×5)
    Blue1,   // 深海蓝 - 1×4
    Blue2,   // 天空蓝 - 1×5

    // 红色系 (2×2, 2×3)
    Red1,    // 深玫红 - 2×2
    Red2,    // 番茄红 - 2×3

    // 黄色系 (2×4, 2×5)
    Yellow1, // 金橙黄 - 2×4
    Yellow2, // 明黄色 - 2×5

    // 灰色系 (3×3, 3×4)
    Gray1,   // 深灰色 - 3×3
    Gray2,   // 浅灰色 - 3×4
}

impl Color {
    /// 获取颜色的CSS表示
    pub fn to_css(&self) -> &'static str {
        match self {
            Color::Black1 => "#1a252f",  // 深墨黑
            Color::Black2 => "#2c3e50",  // 标准黑
            Color::Black3 => "#34495e",  // 浅炭黑
            Color::Blue1 => "#2980b9",   // 深海蓝
            Color::Blue2 => "#3498db",   // 天空蓝
            Color::Red1 => "#c0392b",    // 深玫红
            Color::Red2 => "#e74c3c",    // 番茄红
            Color::Yellow1 => "#d68910", // 金橙黄
            Color::Yellow2 => "#f39c12", // 明黄色
            Color::Gray1 => "#7f8c8d",   // 深灰色
            Color::Gray2 => "#95a5a6",   // 浅灰色
        }
    }

    /// 获取色系名称
    pub fn family(&self) -> &'static str {
        match self {
            Color::Black1 | Color::Black2 | Color::Black3 => "黑色系",
            Color::Blue1 | Color::Blue2 => "蓝色系",
            Color::Red1 | Color::Red2 => "红色系",
            Color::Yellow1 | Color::Yellow2 => "黄色系",
            Color::Gray1 | Color::Gray2 => "灰色系",
        }
    }
}

/// 方块
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Piece {
    /// 方块ID (1-11)
    pub id: u8,
    /// 当前朝向的宽度
    pub width: usize,
    /// 当前朝向的高度
    pub height: usize,
    /// 原始宽度
    pub original_width: usize,
    /// 原始高度
    pub original_height: usize,
    /// 颜色
    pub color: Color,
    /// 是否旋转了90度
    pub rotated: bool,
}

impl Piece {
    /// 创建新方块
    pub fn new(id: u8, width: usize, height: usize, color: Color) -> Self {
        Self {
            id,
            width,
            height,
            original_width: width,
            original_height: height,
            color,
            rotated: false,
        }
    }

    /// 旋转90度
    pub fn rotate(&mut self) {
        std::mem::swap(&mut self.width, &mut self.height);
        self.rotated = !self.rotated;
    }

    /// 重置到初始朝向
    pub fn reset(&mut self) {
        self.width = self.original_width;
        self.height = self.original_height;
        self.rotated = false;
    }

    /// 获取方块面积
    pub fn area(&self) -> usize {
        self.width * self.height
    }
}

/// 棋盘
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Board {
    /// 64个格子的状态
    /// -1 = 障碍格（黑色起始块）
    /// 0 = 空格
    /// 1-11 = 对应piece_id
    #[serde(with = "board_cells_serde")]
    pub(crate) cells: [i8; TOTAL_CELLS],
}

// 自定义序列化支持大数组
mod board_cells_serde {
    use serde::{Deserialize, Deserializer, Serialize, Serializer};
    use crate::TOTAL_CELLS;

    pub fn serialize<S>(cells: &[i8; TOTAL_CELLS], serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        cells.as_slice().serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<[i8; TOTAL_CELLS], D::Error>
    where
        D: Deserializer<'de>,
    {
        let vec = Vec::<i8>::deserialize(deserializer)?;
        vec.try_into()
            .map_err(|_| serde::de::Error::custom("Invalid array length"))
    }
}

impl Board {
    /// 创建空棋盘
    pub fn new() -> Self {
        Self {
            cells: [0; TOTAL_CELLS],
        }
    }

    /// 从数组创建棋盘
    pub fn from_array(cells: [i8; TOTAL_CELLS]) -> Self {
        Self { cells }
    }

    /// 获取指定位置的值
    pub fn get(&self, row: usize, col: usize) -> i8 {
        debug_assert!(row < BOARD_SIZE && col < BOARD_SIZE);
        self.cells[row * BOARD_SIZE + col]
    }

    /// 设置指定位置的值
    pub fn set(&mut self, row: usize, col: usize, value: i8) {
        debug_assert!(row < BOARD_SIZE && col < BOARD_SIZE);
        self.cells[row * BOARD_SIZE + col] = value;
    }

    /// 检查指定位置是否为空
    pub fn is_empty(&self, row: usize, col: usize) -> bool {
        self.get(row, col) == 0
    }

    /// 检查是否可以在指定位置放置方块
    pub fn can_place(&self, piece: &Piece, row: usize, col: usize) -> bool {
        // 检查是否越界
        if row + piece.height > BOARD_SIZE || col + piece.width > BOARD_SIZE {
            return false;
        }

        // 检查所有格子是否为空
        for r in row..row + piece.height {
            for c in col..col + piece.width {
                if !self.is_empty(r, c) {
                    return false;
                }
            }
        }

        true
    }

    /// 在指定位置放置方块
    pub fn place(&mut self, piece: &Piece, row: usize, col: usize) {
        debug_assert!(self.can_place(piece, row, col));
        for r in row..row + piece.height {
            for c in col..col + piece.width {
                self.set(r, c, piece.id as i8);
            }
        }
    }

    /// 从指定位置移除方块
    pub fn remove(&mut self, piece: &Piece, row: usize, col: usize) {
        for r in row..row + piece.height {
            for c in col..col + piece.width {
                if r < BOARD_SIZE && c < BOARD_SIZE && self.get(r, c) == piece.id as i8 {
                    self.set(r, c, 0);
                }
            }
        }
    }

    /// 检查棋盘是否已填满（所有非障碍格都被占用）
    pub fn is_full(&self) -> bool {
        self.cells.iter().all(|&cell| cell != 0)
    }

    /// 获取棋盘数组的引用
    pub fn cells(&self) -> &[i8; TOTAL_CELLS] {
        &self.cells
    }

    /// 将棋盘转换为数组
    pub fn to_array(&self) -> [i8; TOTAL_CELLS] {
        self.cells
    }

    /// 查找第一个空格位置
    pub fn find_first_empty(&self) -> Option<(usize, usize)> {
        for (idx, &cell) in self.cells.iter().enumerate() {
            if cell == 0 {
                let row = idx / BOARD_SIZE;
                let col = idx % BOARD_SIZE;
                return Some((row, col));
            }
        }
        None
    }

    /// 计算空格数量
    pub fn count_empty(&self) -> usize {
        self.cells.iter().filter(|&&cell| cell == 0).count()
    }
}

impl Default for Board {
    fn default() -> Self {
        Self::new()
    }
}

/// 方块放置信息
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Placement {
    /// 方块ID
    pub piece_id: u8,
    /// 放置的行位置
    pub row: usize,
    /// 放置的列位置
    pub col: usize,
    /// 是否旋转了
    pub rotated: bool,
}

/// 解决方案
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Solution {
    /// 最终的棋盘状态
    pub board: Board,
    /// 每个方块的放置位置
    pub placements: Vec<Placement>,
}

/// 求解结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SolveResult {
    /// 无解
    NoSolution,
    /// 唯一解
    UniqueSolution(Solution),
    /// 多个解
    MultipleSolutions(Vec<Solution>),
}

/// 游戏状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    /// 当前棋盘状态
    pub board: Board,
    /// 所有方块
    pub pieces: Vec<Piece>,
    /// 方块是否已使用的标记
    pub used_pieces: Vec<bool>,
    /// 障碍块的位置和ID (row, col, piece_id)
    pub obstacle_positions: Vec<(usize, usize, u8)>,
}

impl GameState {
    /// 创建新的游戏状态
    pub fn new(pieces: Vec<Piece>) -> Self {
        let used_pieces = vec![false; pieces.len()];
        Self {
            board: Board::new(),
            pieces,
            used_pieces,
            obstacle_positions: Vec::new(),
        }
    }
}

/// 难度等级
/// 注意：难度只是给玩家的参考标签，所有关卡都使用相同的3个黑色障碍块（1x1, 1x2, 1x3）
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Difficulty {
    /// 简单 - 玩家参考难度
    Easy,
    /// 中等 - 玩家参考难度
    Medium,
    /// 困难 - 玩家参考难度
    Hard,
}

impl Difficulty {
    /// 获取障碍方块ID
    /// 所有难度都使用相同的3个黑色块：1x1(id=1), 1x2(id=2), 1x3(id=3)
    pub fn get_obstacle_piece_ids(&self) -> Vec<u8> {
        // 忽略难度参数，总是返回黑色块1、2、3
        vec![1, 2, 3]
    }
}
