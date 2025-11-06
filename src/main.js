// Tauri API
const { invoke } = window.__TAURI__.tauri;

// 游戏状态
let gameState = null;
let selectedPiece = null;
let allPieces = [];

// 颜色映射
const colorMap = {
    'Black': '#2c3e50',
    'Blue': '#3498db',
    'Red': '#e74c3c',
    'Yellow': '#f39c12',
    'Gray': '#95a5a6',
};

// DOM元素
const boardEl = document.getElementById('board');
const pieceTrayEl = document.getElementById('pieceTray');
const statusEl = document.getElementById('status');
const difficultyEl = document.getElementById('difficulty');

// 初始化
async function init() {
    try {
        allPieces = await invoke('get_pieces');
        setupEventListeners();
        updateStatus('点击"新关卡"开始游戏');
    } catch (error) {
        console.error('初始化失败:', error);
        updateStatus('初始化失败: ' + error);
    }
}

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('newGame').addEventListener('click', newGame);
    document.getElementById('solve').addEventListener('click', solvePuzzle);
    document.getElementById('reset').addEventListener('click', resetGame);
    document.getElementById('rotate').addEventListener('click', rotatePiece);
    document.getElementById('cancel').addEventListener('click', cancelSelection);
}

// 新游戏
async function newGame() {
    const difficulty = difficultyEl.value;
    updateStatus('生成关卡中...');

    try {
        gameState = await invoke('new_level', { difficulty });
        selectedPiece = null;
        renderBoard();
        renderPieceTray();
        updateStatus('关卡生成成功！开始游戏吧');
    } catch (error) {
        console.error('生成关卡失败:', error);
        updateStatus('生成关卡失败: ' + error);
    }
}

// 渲染棋盘
function renderBoard() {
    if (!gameState) return;

    boardEl.innerHTML = '';

    const cells = gameState.board.cells;
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.index = i;

        const value = cells[i];
        if (value === -1) {
            cell.classList.add('obstacle');
        } else if (value === 0) {
            cell.classList.add('empty');
        } else {
            // 找到对应的piece并设置颜色
            const piece = allPieces.find(p => p.id === value) || gameState.pieces.find(p => p.id === value);
            if (piece) {
                cell.style.background = colorMap[piece.color] || '#ccc';
                cell.textContent = value;
            }
        }

        cell.addEventListener('click', () => handleCellClick(i));
        boardEl.appendChild(cell);
    }
}

// 处理格子点击
async function handleCellClick(index) {
    if (!gameState || !selectedPiece) return;

    const row = Math.floor(index / 8);
    const col = index % 8;

    try {
        const canPlace = await invoke('check_placement', {
            boardCells: gameState.board.cells,
            pieceId: selectedPiece.id,
            row,
            col,
            rotated: selectedPiece.rotated,
        });

        if (canPlace) {
            placePiece(row, col);
        } else {
            updateStatus('不能在这里放置方块');
        }
    } catch (error) {
        console.error('检查放置失败:', error);
    }
}

// 放置方块
function placePiece(row, col) {
    if (!selectedPiece) return;

    // 更新棋盘
    for (let r = 0; r < selectedPiece.height; r++) {
        for (let c = 0; c < selectedPiece.width; c++) {
            const index = (row + r) * 8 + (col + c);
            gameState.board.cells[index] = selectedPiece.id;
        }
    }

    // 标记piece为已使用
    const pieceIndex = gameState.pieces.findIndex(p => p.id === selectedPiece.id);
    if (pieceIndex !== -1) {
        gameState.used_pieces[pieceIndex] = true;
    }

    selectedPiece = null;
    renderBoard();
    renderPieceTray();

    // 检查胜利
    if (checkWin()) {
        updateStatus('恭喜！你完成了拼图！');
    } else {
        updateStatus('方块已放置');
    }
}

// 检查胜利
function checkWin() {
    return gameState.board.cells.every(cell => cell !== 0);
}

// 渲染方块托盘
function renderPieceTray() {
    if (!gameState) return;

    pieceTrayEl.innerHTML = '';

    gameState.pieces.forEach((piece, index) => {
        const isUsed = gameState.used_pieces[index];
        const isSelected = selectedPiece && selectedPiece.id === piece.id;

        const item = document.createElement('div');
        item.className = 'piece-item';
        if (isUsed) item.classList.add('used');
        if (isSelected) item.classList.add('selected');

        // 创建方块预览
        const preview = document.createElement('div');
        preview.className = 'piece-preview';
        preview.style.gridTemplateColumns = `repeat(${piece.width}, 16px)`;
        preview.style.gridTemplateRows = `repeat(${piece.height}, 16px)`;

        for (let i = 0; i < piece.width * piece.height; i++) {
            const previewCell = document.createElement('div');
            previewCell.className = 'piece-preview-cell';
            previewCell.style.background = colorMap[piece.color] || '#ccc';
            preview.appendChild(previewCell);
        }

        // 创建方块信息
        const info = document.createElement('div');
        info.className = 'piece-info';

        const name = document.createElement('div');
        name.className = 'piece-name';
        name.textContent = `方块 ${piece.id}`;

        const size = document.createElement('div');
        size.className = 'piece-size';
        size.textContent = `${piece.width}×${piece.height}`;

        info.appendChild(name);
        info.appendChild(size);

        item.appendChild(preview);
        item.appendChild(info);

        if (!isUsed) {
            item.addEventListener('click', () => selectPiece(piece));
        }

        pieceTrayEl.appendChild(item);
    });
}

// 选择方块
function selectPiece(piece) {
    selectedPiece = { ...piece };
    renderPieceTray();
    updateStatus(`已选择方块 ${piece.id} (${piece.width}×${piece.height})`);
}

// 旋转方块
function rotatePiece() {
    if (!selectedPiece) {
        updateStatus('请先选择一个方块');
        return;
    }

    // 交换宽高
    [selectedPiece.width, selectedPiece.height] = [selectedPiece.height, selectedPiece.width];
    selectedPiece.rotated = !selectedPiece.rotated;

    renderPieceTray();
    updateStatus(`方块已旋转为 ${selectedPiece.width}×${selectedPiece.height}`);
}

// 取消选择
function cancelSelection() {
    selectedPiece = null;
    renderPieceTray();
    updateStatus('已取消选择');
}

// 重置游戏
function resetGame() {
    if (!gameState) return;

    // 重置所有非障碍格
    for (let i = 0; i < 64; i++) {
        if (gameState.board.cells[i] !== -1) {
            gameState.board.cells[i] = 0;
        }
    }

    // 重置所有方块为未使用并恢复原始朝向
    gameState.used_pieces.fill(false);
    gameState.pieces.forEach(piece => {
        piece.width = piece.original_width;
        piece.height = piece.original_height;
        piece.rotated = false;
    });

    selectedPiece = null;
    renderBoard();
    renderPieceTray();
    updateStatus('游戏已重置');
}

// 求解拼图
async function solvePuzzle() {
    if (!gameState) {
        updateStatus('请先开始新游戏');
        return;
    }

    updateStatus('求解中...');

    try {
        const result = await invoke('solve_level', { state: gameState });

        if (result.NoSolution) {
            updateStatus('无解！这个拼图无法完成');
        } else if (result.UniqueSolution) {
            gameState.board = result.UniqueSolution.board;
            gameState.used_pieces.fill(true);
            renderBoard();
            renderPieceTray();
            updateStatus('已自动求解！');
        } else if (result.MultipleSolutions) {
            gameState.board = result.MultipleSolutions[0].board;
            gameState.used_pieces.fill(true);
            renderBoard();
            renderPieceTray();
            updateStatus('已找到一个解（存在多个解）');
        }
    } catch (error) {
        console.error('求解失败:', error);
        updateStatus('求解失败: ' + error);
    }
}

// 更新状态
function updateStatus(message) {
    statusEl.textContent = message;
}

// 启动应用
init();
