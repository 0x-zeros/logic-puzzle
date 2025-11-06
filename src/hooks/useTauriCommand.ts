import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import type { GameState, SolveResult, Piece, Difficulty, ValidationResult } from '../types/game';

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
        console.log('🔍 checkPlacement 调用参数:', {
          boardCells: boardCells.slice(0, 10) + '...',
          boardCellsLength: boardCells.length,
          pieceId,
          row,
          col,
          rotated,
        });

        // Tauri自动将Rust的snake_case转换为camelCase
        const result = await invoke<boolean>('check_placement', {
          boardCells,
          pieceId,
          row,
          col,
          rotated,
        });

        console.log('✅ checkPlacement 返回:', result);
        return result;
      } catch (err) {
        console.error('❌ Check placement error:', err);
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

  const validateCustomObstacles = useCallback(
    async (boardCells: number[]): Promise<ValidationResult | null> => {
      setLoading(true);
      setError(null);
      try {
        // Tauri自动将camelCase转换为snake_case
        const result = await invoke<ValidationResult>('validate_custom_obstacles', {
          boardCells,
        });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    newLevel,
    solveLevel,
    checkPlacement,
    getPieces,
    validateCustomObstacles,
  };
}
