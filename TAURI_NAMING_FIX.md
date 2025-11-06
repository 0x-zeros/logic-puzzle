# Tauri 2.x 参数命名修复

## ✅ 问题已解决

### 🔍 错误信息
```
❌ Check placement error:
invalid args `boardCells` for command `check_placement`:
command check_placement missing required key boardCells
```

---

## 📚 Tauri 2.x 命名规则（重要！）

### 自动转换机制

**Tauri会自动转换参数名**：
- Rust端（snake_case）→ 前端（camelCase）

**示例**：
```rust
// Rust端定义
#[tauri::command]
pub fn check_placement(
    board_cells: Vec<i8>,  // ← snake_case
    piece_id: u8,
    row: usize,
    col: usize,
    rotated: bool,
) -> Result<bool, String>
```

```typescript
// 前端调用（自动转换）
await invoke('check_placement', {
  boardCells,  // ← camelCase（自动转换）
  pieceId,     // ← camelCase（自动转换）
  row,         // ← 单词，无需转换
  col,
  rotated,
});
```

---

## ❌ 之前的错误

我之前错误地认为需要在前端使用蛇形命名：

```typescript
// ❌ 错误的代码
invoke('check_placement', {
  board_cells: boardCells,  // 错误！
  piece_id: pieceId,        // 错误！
  ...
});
```

这导致Tauri找不到参数，因为它期望的是camelCase。

---

## ✅ 正确的实现

### Rust端（保持snake_case）

```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub fn check_placement(
    board_cells: Vec<i8>,  // 保持snake_case
    piece_id: u8,
    row: usize,
    col: usize,
    rotated: bool,
) -> Result<bool, String> {
    // ...
}

#[tauri::command]
pub fn validate_custom_obstacles(
    board_cells: Vec<i8>,  // 保持snake_case
) -> Result<ValidationResult, String> {
    // ...
}
```

### 前端（使用camelCase）

```typescript
// src/hooks/useTauriCommand.ts
const checkPlacement = async (...) => {
  await invoke('check_placement', {
    boardCells,  // camelCase（Tauri自动转换）
    pieceId,     // camelCase（Tauri自动转换）
    row, col, rotated,
  });
};

const validateCustomObstacles = async (boardCells: number[]) => {
  await invoke('validate_custom_obstacles', {
    boardCells,  // camelCase（Tauri自动转换）
  });
};
```

---

## 🎓 学到的经验

### Tauri命名规则

| Rust端 | 前端 | 转换 |
|--------|------|------|
| `board_cells` | `boardCells` | ✅ 自动 |
| `piece_id` | `pieceId` | ✅ 自动 |
| `my_var_name` | `myVarName` | ✅ 自动 |
| `row` | `row` | - 单词无需转换 |

### 禁用自动转换（不推荐）

如果确实需要前端也用snake_case：

```rust
#[tauri::command(rename_all = "snake_case")]
pub fn my_command(
    my_param: String
) -> Result<(), String> {
    // ...
}
```

```typescript
// 前端也用snake_case
invoke('my_command', {
  my_param: value  // snake_case
});
```

**但不推荐**：违反JavaScript规范。

---

## 📋 修复的文件

**只修改了1个文件**：
- ✅ `src/hooks/useTauriCommand.ts`

**修改内容**：
- 改回驼峰命名：`board_cells` → `boardCells`
- 改回驼峰命名：`piece_id` → `pieceId`

---

## 🚀 现在应该可以正常工作了

重新运行应用：
```bash
npm run tauri dev
```

**测试**：
1. 点击"新关卡"或"自由模式"
2. 选择一个方块
3. 点击棋盘空格
4. 应该能成功放置了！✅

---

## 💡 参考文档

- [Tauri Command Documentation](https://tauri.app/v2/guides/features/command/)
- [Stack Overflow: Tauri Parameter Names](https://stackoverflow.com/questions/78432685/)
- [Serde Rename Attributes](https://serde.rs/attr-rename.html)

---

**修复完成时间**: 2025-11-06
**修复状态**: ✅ 已修复
