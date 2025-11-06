//! DFS求解器模块

use crate::types::{Board, Piece, Placement, Solution, SolveResult, GameState};

/// DFS求解器
pub struct Solver {
    /// 最多找多少个解（1=找一个，2=检测唯一性）
    max_solutions: usize,
}

impl Solver {
    /// 创建新的求解器
    pub fn new(max_solutions: usize) -> Self {
        Self { max_solutions }
    }

    /// 创建默认求解器（最多找2个解，用于验证唯一性）
    pub fn default() -> Self {
        Self::new(2)
    }

    /// 求解游戏
    pub fn solve(&self, state: &GameState) -> SolveResult {
        let mut board = state.board.clone();
        let mut pieces: Vec<Piece> = state.pieces
            .iter()
            .enumerate()
            .filter(|(idx, _)| !state.used_pieces[*idx])
            .map(|(_, p)| p.clone())
            .collect();

        let mut used = vec![false; pieces.len()];
        let mut solutions = Vec::new();
        let mut placements_stack = Vec::new();

        self.dfs(&mut board, &mut pieces, &mut used, &mut solutions, &mut placements_stack);

        match solutions.len() {
            0 => SolveResult::NoSolution,
            1 => SolveResult::UniqueSolution(solutions.into_iter().next().unwrap()),
            _ => SolveResult::MultipleSolutions(solutions),
        }
    }

    /// DFS回溯核心算法
    fn dfs(
        &self,
        board: &mut Board,
        pieces: &mut [Piece],
        used: &mut [bool],
        solutions: &mut Vec<Solution>,
        placements: &mut Vec<Placement>,
    ) -> bool {
        // 如果已找到足够多的解，提前返回
        if solutions.len() >= self.max_solutions {
            return true;
        }

        // 如果棋盘已填满，找到一个解
        if board.is_full() {
            solutions.push(Solution {
                board: board.clone(),
                placements: placements.clone(),
            });
            return solutions.len() >= self.max_solutions;
        }

        // 找到第一个空格
        let (row, col) = match board.find_first_empty() {
            Some(pos) => pos,
            None => return false,
        };

        // 尝试每个未使用的方块
        for i in 0..pieces.len() {
            if used[i] {
                continue;
            }

            // 检查是否是正方形（提前，避免后面重复检查）
            let is_square = pieces[i].width == pieces[i].height;

            // 尝试两种朝向
            for rotation in 0..2 {
                if rotation == 1 {
                    pieces[i].rotate();
                }

                // 检查是否可以放置
                if board.can_place(&pieces[i], row, col) {
                    let piece_id = pieces[i].id;
                    let is_rotated = pieces[i].rotated;

                    // 放置方块
                    board.place(&pieces[i], row, col);
                    used[i] = true;
                    placements.push(Placement {
                        piece_id,
                        row,
                        col,
                        rotated: is_rotated,
                    });

                    // 递归搜索
                    if self.dfs(board, pieces, used, solutions, placements) {
                        // 恢复状态
                        placements.pop();
                        board.remove(&pieces[i], row, col);
                        used[i] = false;

                        if rotation == 1 {
                            pieces[i].rotate();
                        }

                        return true; // 已找到足够多的解
                    }

                    // 回溯
                    placements.pop();
                    board.remove(&pieces[i], row, col);
                    used[i] = false;
                }

                if rotation == 1 {
                    pieces[i].rotate();
                }

                // 如果是正方形，不需要尝试旋转
                if is_square {
                    break;
                }
            }
        }

        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::piece::get_standard_pieces;

    #[test]
    fn test_solver_empty_board() {
        let solver = Solver::new(1);
        let pieces = get_standard_pieces();
        let state = GameState::new(pieces);

        let result = solver.solve(&state);

        match result {
            SolveResult::NoSolution => panic!("Should have at least one solution"),
            SolveResult::UniqueSolution(solution) => {
                assert!(solution.board.is_full());
                assert_eq!(solution.placements.len(), 11);
            }
            SolveResult::MultipleSolutions(_) => {
                // 可能有多个解，这也是正常的
            }
        }
    }

    #[test]
    fn test_solver_with_obstacles() {
        let solver = Solver::new(1);
        let mut pieces = get_standard_pieces();
        let mut board = Board::new();

        // 在棋盘上放置3个障碍块（使用前3个piece）
        // 方块1: 1x1 at (0,0)
        board.place(&pieces[0], 0, 0);
        // 方块2: 1x2 at (0,1)
        board.place(&pieces[1], 0, 1);
        // 方块3: 1x3 at (0,3)
        board.place(&pieces[2], 0, 3);

        // 移除这3个piece，只使用剩余的8个
        pieces.drain(0..3);

        let mut state = GameState::new(pieces);
        state.board = board;

        let result = solver.solve(&state);

        // 这个配置可能有解也可能无解，这里只测试不崩溃
        match result {
            SolveResult::NoSolution => {
                // 无解也是正常的
            }
            SolveResult::UniqueSolution(solution) => {
                assert!(solution.board.is_full());
            }
            SolveResult::MultipleSolutions(solutions) => {
                assert!(!solutions.is_empty());
                assert!(solutions[0].board.is_full());
            }
        }
    }

    #[test]
    fn test_solver_impossible_case() {
        let solver = Solver::new(1);
        let mut pieces = get_standard_pieces();
        let mut board = Board::new();

        // 创建一个不可能解决的配置：
        // 留出3个不连续的1x1空格，但移除所有1x1的piece
        // 这样剩余的piece无法填充这些空格
        for row in 0..8 {
            for col in 0..8 {
                if (row, col) != (0, 0) && (row, col) != (3, 3) && (row, col) != (7, 7) {
                    board.set(row, col, -1);
                }
            }
        }

        // 移除1x1的piece (ID=1)，使得无法填充这3个孤立的空格
        pieces.retain(|p| p.id != 1);

        let mut state = GameState::new(pieces);
        state.board = board;

        let result = solver.solve(&state);

        // 这种情况应该无解，因为有3个孤立的1x1空格，但没有1x1的piece
        assert!(matches!(result, SolveResult::NoSolution));
    }
}
