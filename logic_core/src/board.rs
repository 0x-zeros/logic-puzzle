//! 棋盘操作模块

use crate::types::Board;
use crate::BOARD_SIZE;

/// 棋盘辅助函数

impl Board {
    /// 打印棋盘（用于调试）
    pub fn print(&self) {
        println!("┌{}┐", "──".repeat(BOARD_SIZE));
        for row in 0..BOARD_SIZE {
            print!("│");
            for col in 0..BOARD_SIZE {
                let cell = self.get(row, col);
                let ch = match cell {
                    -1 => "■",
                    0 => "·",
                    n if n >= 1 && n <= 9 => {
                        print!("{} ", n);
                        continue;
                    }
                    n if n >= 10 && n <= 11 => {
                        let ch = (b'A' + (n - 10) as u8) as char;
                        print!("{} ", ch);
                        continue;
                    }
                    _ => "?",
                };
                print!("{} ", ch);
            }
            println!("│");
        }
        println!("└{}┘", "──".repeat(BOARD_SIZE));
    }

    /// 清空棋盘
    pub fn clear(&mut self) {
        for cell in self.cells.iter_mut() {
            *cell = 0;
        }
    }

    /// 获取可变的cells引用
    pub fn cells_mut(&mut self) -> &mut [i8; 64] {
        &mut self.cells
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Piece;
    use crate::types::Color;

    #[test]
    fn test_board_new() {
        let board = Board::new();
        for row in 0..BOARD_SIZE {
            for col in 0..BOARD_SIZE {
                assert_eq!(board.get(row, col), 0);
            }
        }
    }

    #[test]
    fn test_board_set_get() {
        let mut board = Board::new();
        board.set(0, 0, 5);
        assert_eq!(board.get(0, 0), 5);

        board.set(7, 7, -1);
        assert_eq!(board.get(7, 7), -1);
    }

    #[test]
    fn test_can_place() {
        let mut board = Board::new();
        let piece = Piece::new(1, 2, 3, Color::Black1);

        // 在空棋盘上应该可以放置
        assert!(board.can_place(&piece, 0, 0));
        assert!(board.can_place(&piece, 5, 6));

        // 越界应该不能放置
        assert!(!board.can_place(&piece, 6, 0)); // 高度越界
        assert!(!board.can_place(&piece, 0, 7)); // 宽度越界

        // 已占用的位置不能放置
        board.set(1, 1, 5);
        assert!(!board.can_place(&piece, 0, 0)); // 会覆盖(1,1)
    }

    #[test]
    fn test_place_and_remove() {
        let mut board = Board::new();
        let piece = Piece::new(1, 2, 3, Color::Black1);

        board.place(&piece, 0, 0);

        // 验证所有格子都被占用
        for r in 0..3 {
            for c in 0..2 {
                assert_eq!(board.get(r, c), 1);
            }
        }

        // 移除方块
        board.remove(&piece, 0, 0);

        // 验证所有格子都被清空
        for r in 0..3 {
            for c in 0..2 {
                assert_eq!(board.get(r, c), 0);
            }
        }
    }

    #[test]
    fn test_is_full() {
        let mut board = Board::new();
        assert!(!board.is_full());

        // 填满棋盘
        for row in 0..BOARD_SIZE {
            for col in 0..BOARD_SIZE {
                board.set(row, col, 1);
            }
        }
        assert!(board.is_full());
    }

    #[test]
    fn test_find_first_empty() {
        let mut board = Board::new();
        assert_eq!(board.find_first_empty(), Some((0, 0)));

        board.set(0, 0, 1);
        assert_eq!(board.find_first_empty(), Some((0, 1)));

        // 填满整个棋盘
        for row in 0..BOARD_SIZE {
            for col in 0..BOARD_SIZE {
                board.set(row, col, 1);
            }
        }
        assert_eq!(board.find_first_empty(), None);
    }
}
