//! 方块定义模块

use crate::types::{Color, Piece};

/// 获取标准的11个方块
pub fn get_standard_pieces() -> Vec<Piece> {
    vec![
        // 黑色方块 (1-3)
        Piece::new(1, 1, 1, Color::Black),  // 1x1
        Piece::new(2, 1, 2, Color::Black),  // 1x2
        Piece::new(3, 1, 3, Color::Black),  // 1x3

        // 蓝色方块 (4-5)
        Piece::new(4, 1, 4, Color::Blue),   // 1x4
        Piece::new(5, 1, 5, Color::Blue),   // 1x5

        // 红色方块 (6-7)
        Piece::new(6, 2, 2, Color::Red),    // 2x2
        Piece::new(7, 2, 3, Color::Red),    // 2x3

        // 黄色方块 (8-9)
        Piece::new(8, 2, 4, Color::Yellow), // 2x4
        Piece::new(9, 2, 5, Color::Yellow), // 2x5

        // 灰色方块 (10-11)
        Piece::new(10, 3, 3, Color::Gray),  // 3x3
        Piece::new(11, 3, 4, Color::Gray),  // 3x4
    ]
}

/// 根据ID获取方块
pub fn get_piece_by_id(id: u8) -> Option<Piece> {
    if id >= 1 && id <= 11 {
        Some(get_standard_pieces()[(id - 1) as usize].clone())
    } else {
        None
    }
}

/// 验证所有方块的总面积是否正确
/// 11个方块总面积 = 1 + 2 + 3 + 4 + 5 + 4 + 6 + 8 + 10 + 9 + 12 = 64
pub fn verify_total_area() -> bool {
    let pieces = get_standard_pieces();
    let total_area: usize = pieces.iter().map(|p| p.area()).sum();
    total_area == 64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_standard_pieces_count() {
        let pieces = get_standard_pieces();
        assert_eq!(pieces.len(), 11);
    }

    #[test]
    fn test_piece_ids() {
        let pieces = get_standard_pieces();
        for (idx, piece) in pieces.iter().enumerate() {
            assert_eq!(piece.id as usize, idx + 1);
        }
    }

    #[test]
    fn test_total_area_is_64() {
        assert!(verify_total_area());
        let pieces = get_standard_pieces();
        let total: usize = pieces.iter().map(|p| p.area()).sum();
        assert_eq!(total, 64, "Total area should be 64 (8x8 board)");
    }

    #[test]
    fn test_piece_colors() {
        let pieces = get_standard_pieces();

        // 黑色: 1-3
        assert_eq!(pieces[0].color, Color::Black);
        assert_eq!(pieces[1].color, Color::Black);
        assert_eq!(pieces[2].color, Color::Black);

        // 蓝色: 4-5
        assert_eq!(pieces[3].color, Color::Blue);
        assert_eq!(pieces[4].color, Color::Blue);

        // 红色: 6-7
        assert_eq!(pieces[5].color, Color::Red);
        assert_eq!(pieces[6].color, Color::Red);

        // 黄色: 8-9
        assert_eq!(pieces[7].color, Color::Yellow);
        assert_eq!(pieces[8].color, Color::Yellow);

        // 灰色: 10-11
        assert_eq!(pieces[9].color, Color::Gray);
        assert_eq!(pieces[10].color, Color::Gray);
    }

    #[test]
    fn test_piece_rotation() {
        let mut piece = Piece::new(1, 2, 3, Color::Black);
        assert_eq!(piece.width, 2);
        assert_eq!(piece.height, 3);
        assert!(!piece.rotated);

        piece.rotate();
        assert_eq!(piece.width, 3);
        assert_eq!(piece.height, 2);
        assert!(piece.rotated);

        piece.rotate();
        assert_eq!(piece.width, 2);
        assert_eq!(piece.height, 3);
        assert!(!piece.rotated);
    }

    #[test]
    fn test_get_piece_by_id() {
        for id in 1..=11 {
            let piece = get_piece_by_id(id);
            assert!(piece.is_some());
            assert_eq!(piece.unwrap().id, id);
        }

        assert!(get_piece_by_id(0).is_none());
        assert!(get_piece_by_id(12).is_none());
    }
}
