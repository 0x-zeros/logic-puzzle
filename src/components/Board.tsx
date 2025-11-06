import { useState } from 'react';
import { COLOR_MAP, PIECE_ID_TO_COLOR } from '../types/game';

interface BoardProps {
  cells: number[];
  pieces: unknown[];  // 保留参数但标记为unknown（为了兼容调用处）
  onCellClick: (index: number) => void;
  onCellRightClick?: (index: number) => void;
}

export function Board({ cells, onCellClick, onCellRightClick }: BoardProps) {
  const [touchTimer, setTouchTimer] = useState<number | null>(null);
  const getCellStyle = (value: number): React.CSSProperties => {
    if (value < 0) {
      // 障碍块（负数ID）
      const pieceId = Math.abs(value);
      const color = PIECE_ID_TO_COLOR[pieceId];
      return {
        backgroundColor: color ? COLOR_MAP[color] : '#2c3e50',
        color: '#fff',
        fontWeight: 'bold',
      };
    } else if (value === 0) {
      // 空格
      return { backgroundColor: '#fff' };
    } else {
      // 已放置的方块 - 使用ID直接映射颜色
      const color = PIECE_ID_TO_COLOR[value];
      return {
        backgroundColor: color ? COLOR_MAP[color] : '#ccc',
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
          onContextMenu={(e) => {
            e.preventDefault();
            onCellRightClick?.(index);
          }}
          onTouchStart={() => {
            // 长按500ms触发移除
            const timer = window.setTimeout(() => {
              onCellRightClick?.(index);
              // 震动反馈（手机）
              if (navigator.vibrate) navigator.vibrate(50);
            }, 500);
            setTouchTimer(timer);
          }}
          onTouchEnd={() => {
            if (touchTimer) {
              clearTimeout(touchTimer);
              setTouchTimer(null);
            }
          }}
          onTouchMove={() => {
            // 手指移动取消长按
            if (touchTimer) {
              clearTimeout(touchTimer);
              setTouchTimer(null);
            }
          }}
          style={{
            ...getCellStyle(value),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {value !== 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 0 3px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: '1',
              }}
            >
              {Math.abs(value)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
