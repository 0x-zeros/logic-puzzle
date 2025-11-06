import { invoke } from '@tauri-apps/api/core';
import { useState, useCallback } from 'react';
import type { GameState, SolveResponse, Piece, Difficulty, ValidationResult } from '../types/game';

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

  const solveLevel = useCallback(async (state: GameState): Promise<SolveResponse | null> => {
    console.log('📤 solveLevel: 准备发送请求');
    console.log('📤 state.pieces.length:', state.pieces.length);
    console.log('📤 state.used_pieces:', state.used_pieces);
    console.log('📤 state.board.cells前10个:', state.board.cells.slice(0, 10));

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 调用invoke...');
      const result = await invoke<SolveResponse>('solve_level', { state });
      console.log('📥 收到响应:', result);
      return result;
    } catch (err) {
      console.error('❌ solveLevel错误:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      console.log('✅ solveLevel完成（finally块）');
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
