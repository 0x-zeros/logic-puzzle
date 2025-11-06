import type { Difficulty } from '../types/game';

interface ControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onSolve: () => void;
  onReset: () => void;
  loading: boolean;
}

export function Controls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onSolve,
  onReset,
  loading,
}: ControlsProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
        style={{
          padding: '8px 16px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          background: 'white',
        }}
      >
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">困难</option>
      </select>

      <button
        onClick={onNewGame}
        disabled={loading}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#ccc' : '#667eea',
          color: 'white',
          transition: 'all 0.2s',
        }}
      >
        新关卡
      </button>

      <button
        onClick={onSolve}
        disabled={loading}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#ccc' : '#667eea',
          color: 'white',
          transition: 'all 0.2s',
        }}
      >
        求解
      </button>

      <button
        onClick={onReset}
        disabled={loading}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#ccc' : '#667eea',
          color: 'white',
          transition: 'all 0.2s',
        }}
      >
        重置
      </button>
    </div>
  );
}
