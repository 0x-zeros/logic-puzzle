import { COLOR_MAP, type Piece } from '../types/game';

interface BoardProps {
  cells: number[];
  pieces: Piece[];
  onCellClick: (index: number) => void;
}

export function Board({ cells, pieces, onCellClick }: BoardProps) {
  const getCellStyle = (value: number): React.CSSProperties => {
    if (value === -1) {
      // 障碍
      return { backgroundColor: '#2c3e50' };
    } else if (value === 0) {
      // 空格
      return { backgroundColor: '#fff' };
    } else {
      // 已放置的方块
      const piece = pieces.find((p) => p.id === value);
      return {
        backgroundColor: piece ? COLOR_MAP[piece.color] : '#ccc',
        color: '#fff',
        fontWeight: 'bold',
      };
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridTemplateRows: 'repeat(8, 1fr)',
        gap: '2px',
        background: '#333',
        border: '3px solid #333',
        borderRadius: '8px',
        aspectRatio: '1',
        maxWidth: '600px',
        maxHeight: '600px',
      }}
    >
      {cells.map((value, index) => (
        <div
          key={index}
          onClick={() => onCellClick(index)}
          style={{
            ...getCellStyle(value),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {value > 0 && value}
        </div>
      ))}
    </div>
  );
}
