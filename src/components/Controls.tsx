import type { Difficulty, GamePhase } from '../types/game';

interface ControlsProps {
  difficulty: Difficulty;
  gamePhase: GamePhase;
  obstaclesPlaced: number;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  onRandomLevel: () => void;
  onCheckSolvable: () => void;
  onSolve: () => void;
  onReset: () => void;
  loading: boolean;
}

export function Controls({
  difficulty,
  gamePhase,
  obstaclesPlaced,
  onDifficultyChange,
  onStartGame,
  onRandomLevel,
  onCheckSolvable,
  onSolve,
  onReset,
  loading,
}: ControlsProps) {
  const phaseText = gamePhase === 'placingObstacles'
    ? `阶段 1/2: 放置黑色障碍块 (${obstaclesPlaced}/3)`
    : gamePhase === 'playing'
    ? '阶段 2/2: 填充剩余方块'
    : '已完成';

  return (
    <div>
      {/* 阶段提示 */}
      {gamePhase !== 'completed' && (
        <div
          style={{
            background: gamePhase === 'placingObstacles' ? '#fff3cd' : '#d1ecf1',
            border: gamePhase === 'placingObstacles' ? '1px solid #ffc107' : '1px solid #bee5eb',
            borderRadius: '6px',
            padding: '10px 16px',
            marginBottom: '12px',
            fontSize: '14px',
            color: gamePhase === 'placingObstacles' ? '#856404' : '#0c5460',
            fontWeight: 'bold',
          }}
        >
          {phaseText}
        </div>
      )}

      {/* 控制按钮 */}
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
        onClick={onStartGame}
        disabled={loading}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? '#ccc' : '#28a745',
          color: 'white',
          fontWeight: 'bold',
          transition: 'all 0.2s',
        }}
      >
        开始游戏
      </button>

      <button
        onClick={onRandomLevel}
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
        随机关卡
      </button>

      <button
        onClick={onCheckSolvable}
        disabled={loading || gamePhase === 'placingObstacles'}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: loading || gamePhase === 'placingObstacles' ? 'not-allowed' : 'pointer',
          background: loading || gamePhase === 'placingObstacles' ? '#ccc' : '#17a2b8',
          color: 'white',
          transition: 'all 0.2s',
        }}
        title={gamePhase === 'placingObstacles' ? '请先完成障碍块放置' : '检测当前局面是否有解'}
      >
        检测有解
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
    </div>
  );
}
