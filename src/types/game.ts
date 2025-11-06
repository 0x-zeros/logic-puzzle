// 游戏核心类型定义（对应Rust types）

export type Color =
  | 'Black1' | 'Black2' | 'Black3'
  | 'Blue1' | 'Blue2'
  | 'Red1' | 'Red2'
  | 'Yellow1' | 'Yellow2'
  | 'Gray1' | 'Gray2';

export interface Piece {
  id: number;
  width: number;
  height: number;
  original_width: number;
  original_height: number;
  color: Color;
  rotated: boolean;
}

export interface Board {
  cells: number[]; // 64个格子：负数(-1,-2,-3)=障碍块ID，0=空，正数(1-11)=已放置方块ID
}

export interface GameState {
  board: Board;
  pieces: Piece[];
  used_pieces: boolean[];
  obstacle_positions: Array<[number, number, number]>; // [row, col, piece_id]
}

export interface Placement {
  piece_id: number;
  row: number;
  col: number;
  rotated: boolean;
}

export interface Solution {
  board: Board;
  placements: Placement[];
}

export interface SolveResponse {
  no_solution: boolean;
  unique_solution: Solution | null;
  multiple_solutions: Solution[] | null;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

// 游戏阶段
export type GamePhase = 'placingObstacles' | 'playing' | 'completed';

export interface ValidationResult {
  has_unique_solution: boolean;
  no_solution: boolean;
  multiple_solutions: boolean;
}

// 颜色映射（同色系内有深浅区分）
export const COLOR_MAP: Record<Color, string> = {
  // 黑色系 - 深→中→浅
  Black1: '#1a252f',  // 深墨黑
  Black2: '#2c3e50',  // 标准黑
  Black3: '#34495e',  // 浅炭黑

  // 蓝色系 - 深→浅
  Blue1: '#2980b9',   // 深海蓝
  Blue2: '#3498db',   // 天空蓝

  // 红色系 - 深→浅
  Red1: '#c0392b',    // 深玫红
  Red2: '#e74c3c',    // 番茄红

  // 黄色系 - 深→浅
  Yellow1: '#d68910', // 金橙黄
  Yellow2: '#f39c12', // 明黄色

  // 灰色系 - 深→浅
  Gray1: '#7f8c8d',   // 深灰色
  Gray2: '#95a5a6',   // 浅灰色
};

// 方块ID到颜色的直接映射（用于Board组件快速查找）
export const PIECE_ID_TO_COLOR: Record<number, Color> = {
  1: 'Black1',
  2: 'Black2',
  3: 'Black3',
  4: 'Blue1',
  5: 'Blue2',
  6: 'Red1',
  7: 'Red2',
  8: 'Yellow1',
  9: 'Yellow2',
  10: 'Gray1',
  11: 'Gray2',
};
