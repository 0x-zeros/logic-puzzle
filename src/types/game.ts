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
  cells: number[]; // 64个格子：-1=障碍，0=空，1-11=piece_id
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

export type SolveResult =
  | { NoSolution: null }
  | { UniqueSolution: Solution }
  | { MultipleSolutions: Solution[] };

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'normal' | 'customObstacles' | 'freePlay';

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
