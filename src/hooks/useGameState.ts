import { useState, useCallback } from 'react';
import type { GameState, Piece } from '../types/game';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  const updateBoard = useCallback(
    (row: number, col: number, piece: Piece, isObstacle: boolean = false): boolean => {
      let isWin = false;

      setGameState((prev) => {
        if (!prev) return null;

        const newCells = [...prev.board.cells];
        const pieceIndex = prev.pieces.findIndex((p) => p.id === piece.id);

        // 放置方块（障碍块用负数，普通方块用正数）
        for (let r = 0; r < piece.height; r++) {
          for (let c = 0; c < piece.width; c++) {
            const index = (row + r) * 8 + (col + c);
            newCells[index] = isObstacle ? -piece.id : piece.id;
          }
        }

      // 标记为已使用
      const newUsedPieces = [...prev.used_pieces];
      if (pieceIndex !== -1) {
        newUsedPieces[pieceIndex] = true;
      }

      // 基于新棋盘判断是否胜利
      isWin = newCells.every((cell) => cell !== 0);

      return {
        ...prev,
        board: { cells: newCells },
        used_pieces: newUsedPieces,
      };
    });

    // 清除选择
    setSelectedPiece(null);

    return isWin;
  }, []);

  const resetGame = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return null;

      // 重置棋盘（保留障碍）
      const newCells = prev.board.cells.map((cell) => (cell < 0 ? cell : 0));

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

  const removePiece = useCallback((cellIndex: number) => {
    setGameState((prev) => {
      if (!prev) return null;

      const pieceId = prev.board.cells[cellIndex];
      if (pieceId <= 0) return prev; // 空格或障碍，无需移除

      // 清除该方块占用的所有格子
      const newCells = prev.board.cells.map((cell) => (cell === pieceId ? 0 : cell));

      // 标记为未使用
      const pieceIndex = prev.pieces.findIndex((p) => p.id === pieceId);
      const newUsedPieces = [...prev.used_pieces];
      if (pieceIndex !== -1) {
        newUsedPieces[pieceIndex] = false;

        // 重置方块朝向
        const newPieces = [...prev.pieces];
        newPieces[pieceIndex] = {
          ...newPieces[pieceIndex],
          width: newPieces[pieceIndex].original_width,
          height: newPieces[pieceIndex].original_height,
          rotated: false,
        };

        return {
          ...prev,
          board: { cells: newCells },
          pieces: newPieces,
          used_pieces: newUsedPieces,
        };
      }

      return {
        ...prev,
        board: { cells: newCells },
        used_pieces: newUsedPieces,
      };
    });
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
    removePiece,
    checkWin,
  };
}
