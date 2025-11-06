import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import type { GameState, SolveResult, Piece, Difficulty } from '../types/game';

export function useTauriCommand() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newLevel = useCallback(async (difficulty: Difficulty): Promise<GameState | null> => {
    setLoading(true);
    setError(null);
    try {
      const state = await invoke<GameState>('new_level', { difficulty });
      return state;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const solveLevel = useCallback(async (state: GameState): Promise<SolveResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<SolveResult>('solve_level', { state });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPlacement = useCallback(
    async (
      boardCells: number[],
      pieceId: number,
      row: number,
      col: number,
      rotated: boolean
    ): Promise<boolean> => {
      try {
        // Rust端使用蛇形命名，需要转换
        return await invoke<boolean>('check_placement', {
          board_cells: boardCells,
          piece_id: pieceId,
          row,
          col,
          rotated,
        });
      } catch (err) {
        console.error('Check placement error:', err);
        return false;
      }
    },
    []
  );

  const getPieces = useCallback(async (): Promise<Piece[]> => {
    try {
      return await invoke<Piece[]>('get_pieces');
    } catch (err) {
      console.error('Get pieces error:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    newLevel,
    solveLevel,
    checkPlacement,
    getPieces,
  };
}
