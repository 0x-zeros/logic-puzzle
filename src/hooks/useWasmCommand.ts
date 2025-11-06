import { useEffect, useState, useCallback } from 'react';
import type { GameState, SolveResponse, Piece, Difficulty, ValidationResult } from '../types/game';

// 动态导入WASM模块
let wasmModule: any = null;
let WasmPuzzle: any = null;

async function loadWasm() {
  if (!wasmModule) {
    wasmModule = await import('../wasm/logic_core');
    await wasmModule.default(); // 初始化WASM
    WasmPuzzle = wasmModule.WasmPuzzle;
  }
  return WasmPuzzle;
}

export function useWasmCommand() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化WASM
  useEffect(() => {
    loadWasm()
      .then((Puzzle) => {
        console.log('✅ WASM模块初始化成功');
        setPuzzle(new Puzzle());
      })
      .catch((err) => {
        console.error('❌ WASM初始化失败:', err);
        setError('WASM初始化失败');
      });
  }, []);

  const newLevel = useCallback(
    async (difficulty: Difficulty): Promise<GameState | null> => {
      if (!puzzle) return null;
      setLoading(true);
      setError(null);
      try {
        const state = puzzle.newLevel(difficulty);
        return state;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [puzzle]
  );

  const solveLevel = useCallback(
    async (state: GameState): Promise<SolveResponse | null> => {
      if (!puzzle) return null;
      setLoading(true);
      setError(null);
      try {
        const result = puzzle.solveLevel(state);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [puzzle]
  );

  const checkPlacement = useCallback(
    async (
      boardCells: number[],
      pieceId: number,
      row: number,
      col: number,
      rotated: boolean
    ): Promise<boolean> => {
      if (!puzzle) return false;
      try {
        // 转换为i8数组
        const cells = Array.from(new Int8Array(boardCells));
        return puzzle.checkPlacement(cells, pieceId, row, col, rotated);
      } catch (err) {
        console.error('Check placement error:', err);
        return false;
      }
    },
    [puzzle]
  );

  const getPieces = useCallback(async (): Promise<Piece[]> => {
    if (!puzzle) return [];
    try {
      const pieces = puzzle.getPieces();
      return pieces;
    } catch (err) {
      console.error('Get pieces error:', err);
      return [];
    }
  }, [puzzle]);

  const validateCustomObstacles = useCallback(
    async (boardCells: number[]): Promise<ValidationResult | null> => {
      if (!puzzle) return null;
      setLoading(true);
      setError(null);
      try {
        const cells = Array.from(new Int8Array(boardCells));
        const result = puzzle.validateCustomObstacles(cells);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [puzzle]
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
