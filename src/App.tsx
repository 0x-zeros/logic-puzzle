import { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { Controls } from './components/Controls';
import { useGameState } from './hooks/useGameState';
import { useTauriCommand } from './hooks/useTauriCommand';
import type { Difficulty, GameMode, Piece as PieceType } from './types/game';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [status, setStatus] = useState('选择游戏模式开始');
  const [isPlacingObstacles, setIsPlacingObstacles] = useState(false);
  const [obstaclesPlaced, setObstaclesPlaced] = useState(0);

  const {
    gameState,
    setGameState,
    selectedPiece,
    selectPiece,
    updateBoard,
    resetGame,
    rotatePiece,
    removePiece,
    checkWin,
  } = useGameState();

  const { loading, error, newLevel, solveLevel, checkPlacement, getPieces, validateCustomObstacles } =
    useTauriCommand();

  // 处理自由模式
  const handleStartFreePlay = useCallback(async () => {
    setGameMode('freePlay');
    setStatus('正在加载方块...');

    try {
      const allPieces = await getPieces();

      setGameState({
        board: { cells: Array(64).fill(0) },
        pieces: allPieces,
        used_pieces: Array(11).fill(false),
        obstacle_positions: [],
      });

      selectPiece(null);
      setStatus('自由模式：随意放置方块，右键可移除');
    } catch (err) {
      setStatus('加载失败: ' + err);
    }
  }, [setGameState, selectPiece, getPieces]);

  // 处理自定义开局模式
  const handleStartCustomObstacles = useCallback(async () => {
    setGameMode('customObstacles');
    setIsPlacingObstacles(true);
    setObstaclesPlaced(0);
    setStatus('正在加载黑色障碍块...');

    try {
      const allPieces = await getPieces();
      const blackPieces = allPieces.filter((p) => p.id <= 3);

      setGameState({
        board: { cells: Array(64).fill(0) },
        pieces: blackPieces,
        used_pieces: [false, false, false],
        obstacle_positions: [],
      });

      selectPiece(null);
      setStatus('自定义开局 - 步骤1/2: 请依次放置3个黑色障碍块');
    } catch (err) {
      setStatus('加载失败: ' + err);
    }
  }, [setGameState, selectPiece, getPieces]);

  // 自定义模式下的方块放置
  const handleCustomObstaclePlacement = useCallback(
    async (row: number, col: number) => {
      if (!selectedPiece) return;

      const canPlace = await checkPlacement(
        gameState!.board.cells,
        selectedPiece.id,
        row,
        col,
        selectedPiece.rotated
      );

      if (canPlace) {
        const isWin = updateBoard(row, col, selectedPiece);
        const newPlaced = obstaclesPlaced + 1;
        setObstaclesPlaced(newPlaced);

        if (newPlaced === 3) {
          setStatus(`3个障碍已放置完成！点击"验证"按钮检查是否有唯一解`);
        } else {
          setStatus(`已放置 ${newPlaced}/3 个障碍块，请继续放置`);
        }
      } else {
        setStatus('不能在这里放置方块');
      }
    },
    [gameState, selectedPiece, checkPlacement, updateBoard, obstaclesPlaced]
  );

  // 验证自定义障碍并开始游戏
  const handleValidateAndStart = useCallback(async () => {
    if (obstaclesPlaced !== 3) {
      setStatus('请先放置全部3个障碍块');
      return;
    }

    setStatus('正在验证配置，请稍候...');

    const result = await validateCustomObstacles(gameState!.board.cells);

    if (!result) {
      setStatus('验证失败');
      return;
    }

    if (result.has_unique_solution) {
      // 成功！标记障碍为-1，加载剩余8个方块
      const allPieces = await getPieces();
      const newCells = gameState!.board.cells.map((cell) => ([1, 2, 3].includes(cell) ? -1 : cell));
      const remainingPieces = allPieces.filter((p) => p.id > 3);

      setGameState({
        board: { cells: newCells },
        pieces: remainingPieces,
        used_pieces: Array(8).fill(false),
        obstacle_positions: [],
      });

      setIsPlacingObstacles(false);
      setObstaclesPlaced(0);
      setStatus('✅ 验证成功！开始游戏 - 使用剩余8个方块填满棋盘');
    } else if (result.no_solution) {
      setStatus('❌ 当前障碍摆放无解，请点击"重置"后重新摆放');
    } else {
      setStatus('⚠️ 当前障碍摆放存在多个解，建议重新摆放以获得唯一解');
    }
  }, [obstaclesPlaced, gameState, validateCustomObstacles, setGameState, getPieces]);

  // 处理右键移除
  const handleCellRightClick = useCallback(
    (index: number) => {
      if (gameMode !== 'freePlay') return;

      const pieceId = gameState?.board.cells[index];
      if (!pieceId || pieceId <= 0) {
        setStatus('这里没有方块可以移除');
        return;
      }

      removePiece(index);
      setStatus(`已移除方块 ${pieceId}`);
    },
    [gameMode, gameState, removePiece]
  );

  // 处理新游戏
  const handleNewGame = useCallback(async () => {
    setGameMode('normal');
    setStatus('生成关卡中...');
    const state = await newLevel(difficulty);
    if (state) {
      setGameState(state);
      selectPiece(null);
      setStatus('关卡生成成功！开始游戏吧');
    } else {
      setStatus('生成关卡失败');
    }
  }, [difficulty, newLevel, setGameState, selectPiece]);

  // 处理求解
  const handleSolve = useCallback(async () => {
    if (!gameState) {
      setStatus('请先开始新游戏');
      return;
    }

    setStatus('求解中...');
    const result = await solveLevel(gameState);

    if (!result) {
      setStatus('求解失败');
      return;
    }

    if ('NoSolution' in result) {
      setStatus('无解！这个拼图无法完成');
    } else if ('UniqueSolution' in result) {
      setGameState({
        ...gameState,
        board: result.UniqueSolution.board,
        used_pieces: new Array(gameState.pieces.length).fill(true),
      });
      setStatus('已自动求解！');
    } else if ('MultipleSolutions' in result) {
      setGameState({
        ...gameState,
        board: result.MultipleSolutions[0].board,
        used_pieces: new Array(gameState.pieces.length).fill(true),
      });
      setStatus('已找到一个解（存在多个解）');
    }
  }, [gameState, solveLevel, setGameState]);

  // 处理格子点击
  const handleCellClick = useCallback(
    async (index: number) => {
      if (!gameState || !selectedPiece) return;

      const row = Math.floor(index / 8);
      const col = index % 8;

      // 自定义开局模式：放置障碍块
      if (gameMode === 'customObstacles' && isPlacingObstacles) {
        handleCustomObstaclePlacement(row, col);
        return;
      }

      // 普通模式和自由模式：正常放置
      const canPlace = await checkPlacement(
        gameState.board.cells,
        selectedPiece.id,
        row,
        col,
        selectedPiece.rotated
      );

      if (canPlace) {
        const isWin = updateBoard(row, col, selectedPiece);
        if (isWin) {
          setStatus('恭喜！你完成了拼图！');
        } else {
          setStatus('方块已放置');
        }
      } else {
        setStatus('不能在这里放置方块');
      }
    },
    [gameState, selectedPiece, gameMode, isPlacingObstacles, checkPlacement, updateBoard, handleCustomObstaclePlacement]
  );

  // 处理方块选择
  const handleSelectPiece = useCallback(
    (piece: typeof gameState.pieces[0]) => {
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
            gameMode={gameMode}
            isPlacingObstacles={isPlacingObstacles}
            obstaclesPlaced={obstaclesPlaced}
            onDifficultyChange={setDifficulty}
            onGameModeChange={setGameMode}
            onNewGame={handleNewGame}
            onStartFreePlay={handleStartFreePlay}
            onStartCustomObstacles={handleStartCustomObstacles}
            onValidateAndStart={handleValidateAndStart}
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
                display: 'grid',
                gridTemplateColumns: '1fr 300px',
                gap: '24px',
                margin: '20px 0',
              }}
            >
              <Board
                cells={gameState.board.cells}
                pieces={gameState.pieces}
                onCellClick={handleCellClick}
                onCellRightClick={handleCellRightClick}
              />
              <PieceTray
                pieces={gameState.pieces}
                usedPieces={gameState.used_pieces}
                selectedPiece={selectedPiece}
                onSelectPiece={handleSelectPiece}
                onRotate={handleRotate}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
              }}
            >
              请点击"新关卡"开始游戏
            </div>
          )}
        </main>

        {/* 状态栏 */}
        <footer
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '2px solid #eee',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '14px',
            }}
          >
            {status}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
