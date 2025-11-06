//! 关卡生成器模块

use crate::types::{Board, Difficulty, GameState, Piece, Solution, SolveResult};
use crate::piece::get_standard_pieces;
use crate::solver::Solver;
use crate::OBSTACLE_COUNT;
use rand::prelude::*;
use rand::seq::{IndexedRandom, SliceRandom};

/// 关卡生成器
pub struct Generator {
    solver: Solver,
    max_retries: usize,
}

impl Generator {
    /// 创建新的生成器
    pub fn new() -> Self {
        Self {
            solver: Solver::new(2), // 验证唯一解需要找2个
            max_retries: 100,
        }
    }

    /// 生成关卡（自动选择方式）
    pub fn generate(&self, difficulty: Difficulty) -> Option<GameState> {
        // 优先使用从完整解反推的方式，因为质量更高
        self.generate_from_solution(difficulty)
            .or_else(|| self.generate_from_obstacles(difficulty))
    }

    /// 方式一：从完整解反推生成关卡
    pub fn generate_from_solution(&self, difficulty: Difficulty) -> Option<GameState> {
        let mut _rng = rand::rng();
        for _ in 0..self.max_retries {
            // 1. 生成一个完整解
            let solution = self.generate_complete_solution()?;

            // 2. 根据难度选择3个方块作为障碍
            let obstacle_ids = self.select_obstacle_pieces(&solution, difficulty);
            if obstacle_ids.len() != OBSTACLE_COUNT {
                continue;
            }

            // 3. 创建新的游戏状态
            let state = self.create_state_from_solution(&solution, &obstacle_ids);

            // 4. 验证有唯一解
            if self.validate_unique_solution(&state) {
                return Some(state);
            }
        }

        None
    }

    /// 方式二：先放障碍再求解
    pub fn generate_from_obstacles(&self, difficulty: Difficulty) -> Option<GameState> {
        let mut rng = rand::rng();

        for _ in 0..self.max_retries {
            // 1. 随机选择3个piece ID作为障碍
            let mut all_pieces = get_standard_pieces();
            let obstacle_piece_candidates = difficulty.get_obstacle_piece_ids();

            if obstacle_piece_candidates.len() < OBSTACLE_COUNT {
                continue;
            }

            let selected_ids: Vec<u8> = obstacle_piece_candidates
                .choose_multiple(&mut rng, OBSTACLE_COUNT)
                .copied()
                .collect();

            // 2. 随机放置这些障碍
            let (board, obstacle_positions) = match self.random_place_obstacles(&selected_ids) {
                Some(result) => result,
                None => continue,
            };

            // 3. 创建游戏状态（移除障碍piece）
            all_pieces.retain(|p| !selected_ids.contains(&p.id));

            let mut state = GameState::new(all_pieces);
            state.board = board;
            state.obstacle_positions = obstacle_positions;

            // 4. 验证有唯一解
            if self.validate_unique_solution(&state) {
                return Some(state);
            }
        }

        None
    }

    /// 生成一个完整解（填满整个8x8棋盘）
    fn generate_complete_solution(&self) -> Option<Solution> {
        let mut rng = rand::rng();
        let mut pieces = get_standard_pieces();

        // 随机打乱方块顺序，增加多样性
        pieces.shuffle(&mut rng);

        // 随机决定某些方块是否旋转
        for piece in &mut pieces {
            if rng.random_bool(0.3) && piece.width != piece.height {
                piece.rotate();
            }
        }

        let state = GameState::new(pieces);
        let solver = Solver::new(1);

        match solver.solve(&state) {
            SolveResult::UniqueSolution(solution) => Some(solution),
            SolveResult::MultipleSolutions(mut solutions) => solutions.pop(),
            SolveResult::NoSolution => None,
        }
    }

    /// 从完整解中选择障碍方块
    fn select_obstacle_pieces(&self, solution: &Solution, difficulty: Difficulty) -> Vec<u8> {
        let mut rng = rand::rng();
        let candidate_ids = difficulty.get_obstacle_piece_ids();

        // 从解中找出符合难度的方块
        let available: Vec<u8> = solution.placements
            .iter()
            .filter(|p| candidate_ids.contains(&p.piece_id))
            .map(|p| p.piece_id)
            .collect();

        // 随机选择3个
        available
            .choose_multiple(&mut rng, OBSTACLE_COUNT.min(available.len()))
            .copied()
            .collect()
    }

    /// 从解和障碍ID创建游戏状态
    fn create_state_from_solution(&self, solution: &Solution, obstacle_ids: &[u8]) -> GameState {
        let mut board = Board::new();
        let mut obstacle_positions = Vec::new();

        // 只放置障碍方块到棋盘
        for placement in &solution.placements {
            if obstacle_ids.contains(&placement.piece_id) {
                let mut piece = get_standard_pieces()[(placement.piece_id - 1) as usize].clone();
                if placement.rotated {
                    piece.rotate();
                }
                board.place(&piece, placement.row, placement.col);
                obstacle_positions.push((placement.row, placement.col, piece.id));

                // 将所有占用的格子都标记为-1
                for r in placement.row..placement.row + piece.height {
                    for c in placement.col..placement.col + piece.width {
                        board.set(r, c, -1);
                    }
                }
            }
        }

        // 创建剩余的方块列表
        let pieces: Vec<Piece> = get_standard_pieces()
            .into_iter()
            .filter(|p| !obstacle_ids.contains(&p.id))
            .collect();

        let mut state = GameState::new(pieces);
        state.board = board;
        state.obstacle_positions = obstacle_positions;

        state
    }

    /// 随机放置障碍方块
    /// 返回：(棋盘, 障碍位置列表)
    fn random_place_obstacles(&self, piece_ids: &[u8]) -> Option<(Board, Vec<(usize, usize, u8)>)> {
        let mut rng = rand::rng();
        let mut board = Board::new();
        let mut positions = Vec::new();

        for &piece_id in piece_ids {
            let mut piece = get_standard_pieces()[(piece_id - 1) as usize].clone();

            // 随机决定是否旋转
            if rng.random_bool(0.5) && piece.width != piece.height {
                piece.rotate();
            }

            // 尝试随机放置
            let mut attempts = 0;
            let mut placed = false;

            while attempts < 50 && !placed {
                let row = rng.random_range(0..8);
                let col = rng.random_range(0..8);

                if board.can_place(&piece, row, col) {
                    board.place(&piece, row, col);

                    // 记录障碍位置（在标记为-1之前）
                    positions.push((row, col, piece_id));

                    // 标记为障碍
                    for r in row..row + piece.height {
                        for c in col..col + piece.width {
                            board.set(r, c, -1);
                        }
                    }

                    placed = true;
                }

                attempts += 1;
            }

            if !placed {
                return None;
            }
        }

        Some((board, positions))
    }

    /// 验证关卡有唯一解
    fn validate_unique_solution(&self, state: &GameState) -> bool {
        match self.solver.solve(state) {
            SolveResult::UniqueSolution(_) => true,
            _ => false,
        }
    }
}

impl Default for Generator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_complete_solution() {
        let generator = Generator::new();

        // 尝试生成几个完整解
        for _ in 0..3 {
            let solution = generator.generate_complete_solution();
            assert!(solution.is_some());

            if let Some(sol) = solution {
                assert!(sol.board.is_full());
                assert_eq!(sol.placements.len(), 11);
            }
        }
    }

    #[test]
    fn test_generate_from_solution_easy() {
        let generator = Generator::new();
        let state = generator.generate_from_solution(Difficulty::Easy);

        if let Some(s) = state {
            // 验证有8个可用方块（11 - 3个障碍）
            assert_eq!(s.pieces.len(), 8);

            // 验证棋盘上有障碍
            let obstacle_count = s.board.cells().iter().filter(|&&c| c == -1).count();
            assert!(obstacle_count > 0);
        }
    }

    #[test]
    fn test_generate_from_obstacles() {
        let generator = Generator::new();

        for difficulty in [Difficulty::Easy, Difficulty::Medium, Difficulty::Hard] {
            let state = generator.generate_from_obstacles(difficulty);

            if let Some(s) = state {
                assert_eq!(s.pieces.len(), 8);
                let obstacle_count = s.board.cells().iter().filter(|&&c| c == -1).count();
                assert!(obstacle_count > 0);
            }
        }
    }
}
