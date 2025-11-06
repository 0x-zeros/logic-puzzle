import { useState, useCallback } from 'react';
import type { GameState, Piece } from '../types/game';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  const updateBoard = useCallback((row: number, col: number, piece: Piece) => {
    setGameState((prev) => {
      if (!prev) return null;

      const newCells = [...prev.board.cells];
      const pieceIndex = prev.pieces.findIndex((p) => p.id === piece.id);

      // 放置方块
      for (let r = 0; r < piece.height; r++) {
        for (let c = 0; c < piece.width; c++) {
          const index = (row + r) * 8 + (col + c);
          newCells[index] = piece.id;
        }
      }

      // 标记为已使用
      const newUsedPieces = [...prev.used_pieces];
      if (pieceIndex !== -1) {
        newUsedPieces[pieceIndex] = true;
      }

      return {
        ...prev,
        board: { cells: newCells },
        used_pieces: newUsedPieces,
      };
    });

    // 清除选择
    setSelectedPiece(null);
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return null;

      // 重置棋盘（保留障碍）
      const newCells = prev.board.cells.map((cell) => (cell === -1 ? -1 : 0));

      // 重置所有方块
      const newPieces = prev.pieces.map((piece) => ({
        ...piece,
        width: piece.original_width,
        height: piece.original_height,
        rotated: false,
      }));

      return {
        ...prev,
        board: { cells: newCells },
        pieces: newPieces,
        used_pieces: new Array(prev.pieces.length).fill(false),
      };
    });

    setSelectedPiece(null);
  }, []);

  const rotatePiece = useCallback(() => {
    setSelectedPiece((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        width: prev.height,
        height: prev.width,
        rotated: !prev.rotated,
      };
    });
  }, []);

  const selectPiece = useCallback((piece: Piece | null) => {
    setSelectedPiece(piece ? { ...piece } : null);
  }, []);

  const checkWin = useCallback(() => {
    if (!gameState) return false;
    return gameState.board.cells.every((cell) => cell !== 0);
  }, [gameState]);

  return {
    gameState,
    setGameState,
    selectedPiece,
    selectPiece,
    updateBoard,
    resetGame,
    rotatePiece,
    checkWin,
  };
}
