# 调试指南 - "不能在这里放置方块"问题

## 🔍 如何调试

### 步骤1：运行应用并打开开发者工具

```bash
npm run tauri dev
```

启动后，在应用窗口中：
- **macOS**: 按 `Cmd + Option + I`
- **Windows/Linux**: 按 `F12`

打开"Console"（控制台）标签。

---

### 步骤2：测试并查看日志

**操作步骤**：
1. 选择一个游戏模式（普通/自由/自定义）
2. 选择一个方块（点击右侧方块列表）
3. 点击棋盘上的空格

**在控制台中查看**：

应该看到类似的输出：
```
=== handleCellClick ===
index: 12
gameState: {board: {...}, pieces: Array(8), ...}
selectedPiece: {id: 4, width: 1, height: 4, ...}
放置位置: {row: 1, col: 4}
方块: {id: 4, width: 1, height: 4, rotated: false}
调用checkPlacement...
board.cells: [0, 0, 0, ..., -1, -1, ...]
🔍 checkPlacement 调用参数: {boardCells: "0,0,0,0,0,0,0,0,0,0...", boardCellsLength: 64, pieceId: 4, row: 1, col: 4, rotated: false}
✅ checkPlacement 返回: true  ← 关键：这里应该是true
```

---

### 步骤3：根据日志诊断问题

#### 情况A：看到 "❌ 无gameState或selectedPiece"
**原因**: 没有正确选择方块或开始游戏
**解决**:
1. 确保已点击"新关卡"或模式按钮
2. 确保已点击右侧方块列表选择方块

---

#### 情况B：看到 "❌ Check placement error: ..."
**原因**: Rust端出错
**可能的错误**:
1. `Invalid board size` - board.cells长度不是64
2. `Invalid piece ID` - piece_id不在1-11范围
3. 其他Rust端错误

**解决**: 查看错误信息并修复对应问题

---

#### 情况C：看到 "✅ checkPlacement 返回: false"
**原因**: Rust的can_place逻辑返回false
**可能原因**:
1. 位置会越界（row + height > 8 或 col + width > 8）
2. 目标位置已被占用
3. 方块尺寸计算错误

**解决**: 检查：
```javascript
console.log('检查越界:');
console.log('row:', row, 'height:', selectedPiece.height, 'row+height:', row + selectedPiece.height, '应该 <= 8');
console.log('col:', col, 'width:', selectedPiece.width, 'col+width:', col + selectedPiece.width, '应该 <= 8');

console.log('检查目标区域:');
for (let r = row; r < row + selectedPiece.height; r++) {
  for (let c = col; c < col + selectedPiece.width; c++) {
    const idx = r * 8 + c;
    console.log(`格子[${r},${c}] (${idx}):`, gameState.board.cells[idx], '应该是0');
  }
}
```

---

#### 情况D：没有任何日志输出
**原因**: handleCellClick根本没被调用
**解决**: 检查Board组件的onClick是否正确绑定

---

### 步骤4：常见问题和解决方案

#### 问题1：selectedPiece是null
```
原因: 没有点击方块列表选择方块
解决: 点击右侧方块列表中的任意方块
```

#### 问题2：gameState是null
```
原因: 没有开始游戏
解决: 点击"新关卡"或"自由模式"或"自定义开局"
```

#### 问题3：checkPlacement一直返回false
```
可能原因1: 方块太大，放不下
  - 检查: 是否尝试在边缘放置大方块？
  - 解决: 选择更小的方块或换个位置

可能原因2: 目标位置已被占用
  - 检查: 是否点击了已有方块的格子？
  - 解决: 点击空白格子（白色）

可能原因3: Rust端逻辑错误
  - 检查: 查看Rust控制台输出
  - 解决: 检查src-tauri/src/commands.rs的check_placement实现
```

---

### 步骤5：检查Rust端日志

在运行`npm run tauri dev`的终端中，查看Rust端的输出。

如果需要添加Rust日志：

```rust
// src-tauri/src/commands.rs
pub fn check_placement(...) -> Result<bool, String> {
    eprintln!("=== Rust check_placement ===");
    eprintln!("board_cells length: {}", board_cells.len());
    eprintln!("piece_id: {}, row: {}, col: {}, rotated: {}", piece_id, row, col, rotated);

    // ... 现有逻辑 ...

    let result = board.can_place(&piece, row, col);
    eprintln!("can_place result: {}", result);

    Ok(result)
}
```

---

## 🔧 快速测试脚本

在浏览器控制台运行：

```javascript
// 测试1：检查是否有gameState
console.log('gameState存在?', window.__GAME_STATE__ !== undefined);

// 测试2：手动调用checkPlacement
const testCheck = async () => {
  const { invoke } = window.__TAURI__.tauri;
  const result = await invoke('check_placement', {
    board_cells: Array(64).fill(0),  // 空棋盘
    piece_id: 1,  // 1x1方块
    row: 0,
    col: 0,
    rotated: false
  });
  console.log('手动测试结果:', result);
};
testCheck();
```

---

## 📋 检查清单

运行应用后，依次检查：

- [ ] 应用窗口正常打开
- [ ] 控制台无错误信息
- [ ] 点击"普通模式"或"自由模式"
- [ ] 右侧显示方块列表
- [ ] 点击一个方块，看到状态提示
- [ ] 点击棋盘，查看控制台日志
- [ ] 根据日志输出定位问题

---

## 🎯 预期的正常流程

### 正常情况的日志输出

```
=== handleCellClick ===
index: 0
gameState: {board: {cells: Array(64)}, pieces: Array(8), used_pieces: Array(8)}
selectedPiece: {id: 4, width: 1, height: 4, color: "Blue1", rotated: false}
放置位置: {row: 0, col: 0}
方块: {id: 4, width: 1, height: 4, rotated: false}
调用checkPlacement...
board.cells: [0, 0, 0, 0, ..., -1, -1, -1]
🔍 checkPlacement 调用参数: {boardCells: "0,0,0,0,0,0,0,0,0,0...", boardCellsLength: 64, pieceId: 4, row: 0, col: 0, rotated: false}
✅ checkPlacement 返回: true  ✅ 成功
状态更新: "方块已放置"
```

### 异常情况的日志输出

```
=== handleCellClick ===
...
🔍 checkPlacement 调用参数: {...}
❌ Check placement error: Error: ...  ← 查看这里的错误
✅ checkPlacement 返回: false
状态更新: "不能在这里放置方块"
```

---

## 💡 下一步

1. **运行应用**: `npm run tauri dev`
2. **打开控制台**: Cmd+Option+I (macOS) 或 F12
3. **执行操作**: 选择方块 → 点击棋盘
4. **查看日志**: 在这里回复控制台的输出内容
5. **定位问题**: 根据日志确定具体问题所在

---

**准备好后，请告诉我控制台显示的内容，我会帮您精确定位问题！**
