//! 方块定义模块

use crate::types::{Color, Piece};

/// 获取标准的11个方块（每个方块有独立颜色）
pub fn get_standard_pieces() -> Vec<Piece> {
    vec![
        // 黑色系 (1-3) - 深→中→浅
        Piece::new(1, 1, 1, Color::Black1),  // 1×1 深墨黑
        Piece::new(2, 1, 2, Color::Black2),  // 1×2 标准黑
        Piece::new(3, 1, 3, Color::Black3),  // 1×3 浅炭黑

        // 蓝色系 (4-5) - 深→浅
        Piece::new(4, 1, 4, Color::Blue1),   // 1×4 深海蓝
        Piece::new(5, 1, 5, Color::Blue2),   // 1×5 天空蓝

        // 红色系 (6-7) - 深→浅
        Piece::new(6, 2, 2, Color::Red1),    // 2×2 深玫红
        Piece::new(7, 2, 3, Color::Red2),    // 2×3 番茄红

        // 黄色系 (8-9) - 深→浅
        Piece::new(8, 2, 4, Color::Yellow1), // 2×4 金橙黄
        Piece::new(9, 2, 5, Color::Yellow2), // 2×5 明黄色

        // 灰色系 (10-11) - 深→浅
        Piece::new(10, 3, 3, Color::Gray1),  // 3×3 深灰色
        Piece::new(11, 3, 4, Color::Gray2),  // 3×4 浅灰色
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

        // 黑色系: 1-3 (每个独立颜色)
        assert_eq!(pieces[0].color, Color::Black1);
        assert_eq!(pieces[1].color, Color::Black2);
        assert_eq!(pieces[2].color, Color::Black3);

        // 蓝色系: 4-5
        assert_eq!(pieces[3].color, Color::Blue1);
        assert_eq!(pieces[4].color, Color::Blue2);

        // 红色系: 6-7
        assert_eq!(pieces[5].color, Color::Red1);
        assert_eq!(pieces[6].color, Color::Red2);

        // 黄色系: 8-9
        assert_eq!(pieces[7].color, Color::Yellow1);
        assert_eq!(pieces[8].color, Color::Yellow2);

        // 灰色系: 10-11
        assert_eq!(pieces[9].color, Color::Gray1);
        assert_eq!(pieces[10].color, Color::Gray2);
    }

    #[test]
    fn test_color_families() {
        let pieces = get_standard_pieces();

        // 验证色系分组
        assert_eq!(pieces[0].color.family(), "黑色系");
        assert_eq!(pieces[1].color.family(), "黑色系");
        assert_eq!(pieces[2].color.family(), "黑色系");
        assert_eq!(pieces[3].color.family(), "蓝色系");
        assert_eq!(pieces[4].color.family(), "蓝色系");
    }

    #[test]
    fn test_piece_rotation() {
        let mut piece = Piece::new(1, 2, 3, Color::Black1);
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
