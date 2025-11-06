// 游戏核心类型定义（对应Rust types）

export type Color = 'Black' | 'Blue' | 'Red' | 'Yellow' | 'Gray';

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

// 颜色映射
export const COLOR_MAP: Record<Color, string> = {
  Black: '#2c3e50',
  Blue: '#3498db',
  Red: '#e74c3c',
  Yellow: '#f39c12',
  Gray: '#95a5a6',
};
