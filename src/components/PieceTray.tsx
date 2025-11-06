import { COLOR_MAP, type Piece, type GamePhase } from '../types/game';

interface PieceTrayProps {
  pieces: Piece[];
  usedPieces: boolean[];
  selectedPiece: Piece | null;
  gamePhase: GamePhase;
  onSelectPiece: (piece: Piece) => void;
  onRotate: () => void;
  onCancel: () => void;
}

export function PieceTray({
  pieces,
  usedPieces,
  selectedPiece,
  gamePhase,
  onSelectPiece,
  onRotate,
  onCancel,
}: PieceTrayProps) {
  return (
    <div
      style={{
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ marginBottom: '12px', color: '#333', fontSize: '18px' }}>方块列表</h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          overflowY: 'auto',
          marginBottom: '12px',
        }}
      >
        {pieces.map((piece, index) => {
          const isUsed = usedPieces[index];
          const isSelected = selectedPiece?.id === piece.id;

          // 阶段性禁用判断
          const isDisabled =
            (gamePhase === 'placingObstacles' && piece.id > 3) || // 阶段1只能选1,2,3
            (gamePhase === 'playing' && piece.id <= 3) || // 阶段2不能选1,2,3（已锁定）
            isUsed;

          return (
            <div
              key={piece.id}
              onClick={() => !isDisabled && onSelectPiece(piece)}
              style={{
                background: 'white',
                border: isSelected ? '2px solid #667eea' : '2px solid #ddd',
                borderRadius: '6px',
                padding: '12px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isDisabled ? 0.4 : 1,
                backgroundColor: isSelected ? '#f0f4ff' : 'white',
              }}
            >
              {/* 方块预览 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${piece.width}, 16px)`,
                  gridTemplateRows: `repeat(${piece.height}, 16px)`,
                  gap: '1px',
                  background: '#333',
                  borderRadius: '3px',
                  padding: '1px',
                }}
              >
                {Array.from({ length: piece.width * piece.height }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '16px',
                      height: '16px',
                      background: COLOR_MAP[piece.color],
                    }}
                  />
                ))}
              </div>

              {/* 方块信息 */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                  方块 {piece.id}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {piece.width}×{piece.height}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onRotate}
          disabled={!selectedPiece}
          style={{
            flex: 1,
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: selectedPiece ? 'pointer' : 'not-allowed',
            background: selectedPiece ? '#667eea' : '#ccc',
            color: 'white',
            transition: 'all 0.2s',
          }}
        >
          旋转
        </button>
        <button
          onClick={onCancel}
          disabled={!selectedPiece}
          style={{
            flex: 1,
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: selectedPiece ? 'pointer' : 'not-allowed',
            background: selectedPiece ? '#667eea' : '#ccc',
            color: 'white',
            transition: 'all 0.2s',
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
}
