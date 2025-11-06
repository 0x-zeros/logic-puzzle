import type { Difficulty, GameMode } from '../types/game';

interface ControlsProps {
  difficulty: Difficulty;
  gameMode: GameMode;
  isPlacingObstacles?: boolean;
  obstaclesPlaced?: number;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onGameModeChange: (mode: GameMode) => void;
  onNewGame: () => void;
  onStartFreePlay: () => void;
  onStartCustomObstacles: () => void;
  onValidateAndStart?: () => void;
  onSolve: () => void;
  onReset: () => void;
  loading: boolean;
}

export function Controls({
  difficulty,
  gameMode,
  isPlacingObstacles = false,
  obstaclesPlaced = 0,
  onDifficultyChange,
  onGameModeChange,
  onNewGame,
  onStartFreePlay,
  onStartCustomObstacles,
  onValidateAndStart,
  onSolve,
  onReset,
  loading,
}: ControlsProps) {
  return (
    <div>
      {/* 模式切换 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => onGameModeChange('normal')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            background: gameMode === 'normal' ? '#667eea' : '#e0e0e0',
            color: gameMode === 'normal' ? 'white' : '#666',
            fontWeight: gameMode === 'normal' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          普通模式
        </button>

        <button
          onClick={() => {
            onGameModeChange('freePlay');
            onStartFreePlay();
          }}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            background: gameMode === 'freePlay' ? '#667eea' : '#e0e0e0',
            color: gameMode === 'freePlay' ? 'white' : '#666',
            fontWeight: gameMode === 'freePlay' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          自由模式
        </button>

        <button
          onClick={() => {
            onGameModeChange('customObstacles');
            onStartCustomObstacles();
          }}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            background: gameMode === 'customObstacles' ? '#667eea' : '#e0e0e0',
            color: gameMode === 'customObstacles' ? 'white' : '#666',
            fontWeight: gameMode === 'customObstacles' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          自定义开局
        </button>
      </div>

      {/* 自定义开局模式的进度提示 */}
      {gameMode === 'customObstacles' && isPlacingObstacles && (
        <div
          style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px',
            fontSize: '14px',
            color: '#856404',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            步骤 1/2: 放置障碍块
          </div>
          <div>
            已放置: {obstaclesPlaced}/3 个黑色障碍块
          </div>
          {obstaclesPlaced === 3 && (
            <button
              onClick={onValidateAndStart}
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#ccc' : '#28a745',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {loading ? '验证中...' : '✓ 验证并开始游戏'}
            </button>
          )}
        </div>
      )}

      {/* 原有控制按钮 */}
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
    </div>
  );
}
