import { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { Controls } from './components/Controls';
import { useGameState } from './hooks/useGameState';
import { useCommand } from './hooks/useCommand';
import { useDeviceType } from './hooks/useDeviceType';
import type { Difficulty, GamePhase, Piece as PieceType } from './types/game';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gamePhase, setGamePhase] = useState<GamePhase>('placingObstacles');
  const [status, setStatus] = useState('点击"开始游戏"');
  const [allPieces, setAllPieces] = useState<PieceType[]>([]);

  const {
    gameState,
    setGameState,
    selectedPiece,
    selectPiece,
    updateBoard,
    resetGame,
    rotatePiece,
    removePiece,
  } = useGameState();

  const { loading, error, newLevel, solveLevel, checkPlacement, getPieces, validateCustomObstacles } =
    useCommand();

  const { isMobile } = useDeviceType();

  // 初始化：加载所有方块数据
  useEffect(() => {
    getPieces().then((pieces) => setAllPieces(pieces));
  }, [getPieces]);

  // 自动开局：allPieces加载完成后，自动生成简单关卡
  useEffect(() => {
    const autoStart = async () => {
      if (allPieces.length === 11 && !gameState) {
        console.log('🎮 自动生成简单关卡...');
        setStatus('正在生成简单关卡...');
        const state = await newLevel('easy');
        if (state) {
          setGameState(state);
          setGamePhase('playing');
          setStatus('欢迎！已自动生成简单关卡，开始游戏吧 (手机可长按移除方块)');
        }
      }
    };
    autoStart();
  }, [allPieces.length, gameState, newLevel, setGameState]);

  // 计算已放置的障碍数量（统计不同的障碍块ID，而不是格子数）
  const obstaclesPlaced = gameState
    ? new Set(gameState.board.cells.filter((c) => c < 0).map((c) => Math.abs(c))).size
    : 0;

  // 阶段自动切换：当3个障碍都放置完成后，自动进入游戏阶段
  useEffect(() => {
    console.log('🔍 阶段切换检查:', {
      obstaclesPlaced,
      gamePhase,
      hasGameState: !!gameState,
      allPiecesLength: allPieces.length,
    });

    if (obstaclesPlaced === 3 && gamePhase === 'placingObstacles' && gameState) {
      console.log('✅ 切换到阶段2');
      setGamePhase('playing');

      // 加载剩余8个方块（4-11）
      const remainingPieces = allPieces.filter((p) => p.id > 3);
      setGameState({
        ...gameState,
        pieces: [...allPieces.filter((p) => p.id <= 3), ...remainingPieces],
        used_pieces: [true, true, true, ...Array(8).fill(false)],
      });

      setStatus('✅ 阶段2/2: 障碍块已锁定，使用方块4-11填满棋盘（可右键移除4-11）');
    }
  }, [obstaclesPlaced, gamePhase, gameState, allPieces, setGameState]);

  // 开始游戏（统一入口）
  const handleStartGame = useCallback(() => {
    setGamePhase('placingObstacles');

    setGameState({
      board: { cells: Array(64).fill(0) },
      pieces: allPieces,
      used_pieces: Array(11).fill(false),
      obstacle_positions: [],
    });

    selectPiece(null);
    setStatus('阶段1/2: 请先放置3个黑色障碍块（1×1, 1×2, 1×3），可右键移除重新放');
  }, [setGameState, selectPiece, allPieces]);

  // 检测当前局面是否有解
  const handleCheckSolvable = useCallback(async () => {
    if (!gameState) {
      setStatus('请先开始游戏');
      return;
    }

    setStatus('正在检测当前局面...');

    const result = await validateCustomObstacles(gameState.board.cells);

    if (!result) {
      setStatus('检测失败');
      return;
    }

    if (result.has_unique_solution) {
      setStatus('✅ 当前局面有唯一解！可以继续游戏');
    } else if (result.no_solution) {
      setStatus('❌ 当前局面无解，需要调整');
    } else {
      setStatus('⚠️ 当前局面有多个解');
    }
  }, [gameState, validateCustomObstacles]);

  // 处理右键移除
  const handleCellRightClick = useCallback(
    (index: number) => {
      if (!gameState) return;

      const value = gameState.board.cells[index];

      if (value === 0) {
        setStatus('这是空格，无法移除');
        return;
      }

      if (value < 0) {
        // 障碍块（负数）
        if (gamePhase === 'playing') {
          setStatus('❌ 障碍块已锁定，无法移除');
          return;
        }
        // 阶段1可以移除障碍
        removePiece(index);
        setStatus(`已移除障碍块 ${Math.abs(value)}`);
      } else {
        // 普通方块（正数）
        removePiece(index);
        setStatus(`已移除方块 ${value}`);
      }
    },
    [gameState, gamePhase, removePiece]
  );

  // 随机生成关卡（可选功能）
  const handleRandomLevel = useCallback(async () => {
    setStatus('生成随机关卡中...');
    const state = await newLevel(difficulty);
    if (state) {
      setGameState(state);
      selectPiece(null);
      setGamePhase('playing'); // 直接进入游戏阶段
      setStatus('随机关卡生成成功！开始游戏');
    } else {
      setStatus('生成关卡失败');
    }
  }, [difficulty, newLevel, setGameState, selectPiece]);

  // 处理求解
  const handleSolve = useCallback(async () => {
    console.log('=== handleSolve 开始 ===');

    if (!gameState) {
      setStatus('请先开始新游戏');
      return;
    }

    console.log('当前gameState:', gameState);
    console.log('pieces数量:', gameState.pieces.length);
    console.log('used_pieces:', gameState.used_pieces);

    setStatus('求解中...');

    console.log('调用solveLevel...');
    const result = await solveLevel(gameState);
    console.log('solveLevel返回:', result);

    if (!result) {
      setStatus('求解失败');
      return;
    }

    if (result.no_solution) {
      setStatus('❌ 无解！这个拼图无法完成');
    } else if (result.unique_solution && gameState) {
      setGameState({
        ...gameState,
        board: result.unique_solution.board,
        used_pieces: new Array(gameState.pieces.length).fill(true),
      });
      setGamePhase('completed');
      setStatus('✅ 已自动求解！');
    } else if (result.multiple_solutions && result.multiple_solutions.length > 0 && gameState) {
      setGameState({
        ...gameState,
        board: result.multiple_solutions[0].board,
        used_pieces: new Array(gameState.pieces.length).fill(true),
      });
      setGamePhase('completed');
      setStatus('✅ 已找到一个解（存在多个解）');
    }
  }, [gameState, solveLevel, setGameState]);

  // 处理格子点击
  const handleCellClick = useCallback(
    async (index: number) => {
      if (!gameState || !selectedPiece) return;

      const row = Math.floor(index / 8);
      const col = index % 8;

      // 阶段1：只能放置黑色块1,2,3
      if (gamePhase === 'placingObstacles' && selectedPiece.id > 3) {
        setStatus('阶段1只能放置黑色障碍块（1、2、3）');
        return;
      }

      // 阶段2：不能放置黑色块
      if (gamePhase === 'playing' && selectedPiece.id <= 3) {
        setStatus('障碍块已锁定，请使用方块4-11');
        return;
      }

      const canPlace = await checkPlacement(
        gameState.board.cells,
        selectedPiece.id,
        row,
        col,
        selectedPiece.rotated
      );

      if (canPlace) {
        // 阶段1放置的是障碍块（负数），阶段2放置的是普通块（正数）
        const isObstacle = gamePhase === 'placingObstacles';
        const isWin = updateBoard(row, col, selectedPiece, isObstacle);

        if (gamePhase === 'placingObstacles') {
          // 障碍计数会在下次渲染时更新（通过obstaclesPlaced计算）
          setStatus(`已放置障碍块 ${selectedPiece.id}`);
        } else if (isWin) {
          setGamePhase('completed');
          setStatus('🎉 恭喜！你完成了拼图！');
        } else {
          setStatus('方块已放置');
        }
      } else {
        setStatus('不能在这里放置方块');
      }
    },
    [gameState, selectedPiece, gamePhase, checkPlacement, updateBoard, obstaclesPlaced]
  );

  // 处理方块选择
  const handleSelectPiece = useCallback(
    (piece: PieceType) => {
      selectPiece(piece);
      setStatus(`已选择方块 ${piece.id} (${piece.width}×${piece.height})`);
    },
    [selectPiece]
  );

  // 处理旋转
  const handleRotate = useCallback(() => {
    if (!selectedPiece) {
      setStatus('请先选择一个方块');
      return;
    }
    rotatePiece();
    setStatus(`方块已旋转`);
  }, [selectedPiece, rotatePiece]);

  // 处理取消选择
  const handleCancel = useCallback(() => {
    selectPiece(null);
    setStatus('已取消选择');
  }, [selectPiece]);

  // 处理重置
  const handleReset = useCallback(() => {
    resetGame();
    setStatus('游戏已重置');
  }, [resetGame]);

  // 显示错误
  useEffect(() => {
    if (error) {
      setStatus(`错误: ${error}`);
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '24px',
          maxWidth: '1200px',
          width: '95%',
        }}
      >
        {/* 标题 */}
        <header
          style={{
            marginBottom: '20px',
            borderBottom: '2px solid #eee',
            paddingBottom: '16px',
          }}
        >
          <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '12px' }}>逻辑拼图</h1>
          <Controls
            difficulty={difficulty}
            gamePhase={gamePhase}
            obstaclesPlaced={obstaclesPlaced}
            onDifficultyChange={setDifficulty}
            onStartGame={handleStartGame}
            onRandomLevel={handleRandomLevel}
            onCheckSolvable={handleCheckSolvable}
            onSolve={handleSolve}
            onReset={handleReset}
            loading={loading}
          />
        </header>

        {/* 主游戏区域 */}
        <main>
          {gameState ? (
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '24px',
                margin: '20px 0',
              }}
            >
              {/* PC端：左侧棋盘+状态 */}
              {!isMobile && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Board
                    cells={gameState.board.cells}
                    pieces={gameState.pieces}
                    onCellClick={handleCellClick}
                    onCellRightClick={handleCellRightClick}
                  />
                  {/* 状态提示 */}
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      color: '#495057',
                      fontSize: '14px',
                      textAlign: 'center',
                    }}
                  >
                    {status}
                  </div>
                </div>
              )}

              {/* 移动端：棋盘 */}
              {isMobile && (
                <Board
                  cells={gameState.board.cells}
                  pieces={gameState.pieces}
                  onCellClick={handleCellClick}
                  onCellRightClick={handleCellRightClick}
                />
              )}

              {/* 移动端：状态提示（紧贴棋盘下方） */}
              {isMobile && (
                <div
                  style={{
                    padding: '10px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6',
                    color: '#495057',
                    fontSize: '13px',
                    textAlign: 'center',
                  }}
                >
                  {status}
                </div>
              )}

              {/* 方块列表（PC右侧，移动端底部） */}
              <div style={{ width: isMobile ? '100%' : '300px' }}>
                <PieceTray
                  pieces={gameState.pieces}
                  usedPieces={gameState.used_pieces}
                  selectedPiece={selectedPiece}
                  gamePhase={gamePhase}
                  onSelectPiece={handleSelectPiece}
                  onRotate={handleRotate}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
              }}
            >
              点击"开始游戏"或"随机关卡"开始
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
