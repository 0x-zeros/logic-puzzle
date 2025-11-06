import { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { PieceTray } from './components/PieceTray';
import { Controls } from './components/Controls';
import { useGameState } from './hooks/useGameState';
import { useTauriCommand } from './hooks/useTauriCommand';
import type { Difficulty } from './types/game';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [status, setStatus] = useState('点击"新关卡"开始游戏');

  const {
    gameState,
    setGameState,
    selectedPiece,
    selectPiece,
    updateBoard,
    resetGame,
    rotatePiece,
    checkWin,
  } = useGameState();

  const { loading, error, newLevel, solveLevel, checkPlacement } = useTauriCommand();

  // 处理新游戏
  const handleNewGame = useCallback(async () => {
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
    [gameState, selectedPiece, checkPlacement, updateBoard]
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
            onDifficultyChange={setDifficulty}
            onNewGame={handleNewGame}
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
