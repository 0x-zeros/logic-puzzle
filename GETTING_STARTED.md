# 逻辑拼图 - 快速开始指南

## 📖 如何使用这个项目

### 环境准备

#### 1. 检查 Rust 版本

```bash
# 检查 Rust 版本（需要 1.85+）
rustc --version

# 如果版本过低，更新 Rust
rustup update stable
```

#### 2. 检查 Node.js 版本

```bash
# 检查 Node.js 版本（需要 18+）
node --version

# 如果未安装，访问 https://nodejs.org/
```

---

### 🚀 快速启动

#### 方式一：一键启动（推荐）

```bash
# 1. 安装前端依赖
npm install

# 2. 启动应用（前端+后端一起）
npm run tauri dev
```

这会自动：
- 启动 Vite 开发服务器（前端）
- 编译并运行 Tauri 应用（后端）
- 打开游戏窗口

#### 方式二：分步启动

```bash
# 终端1: 启动前端开发服务器
npm run dev

# 终端2: 启动 Tauri 后端
cd src-tauri
cargo run
```

---

### 🎮 如何玩游戏

1. **选择难度**:
   - 点击下拉菜单选择"简单"、"中等"或"困难"
   - 注意：难度只是标签，所有关卡都使用相同的3个黑色障碍块

2. **开始新游戏**:
   - 点击"新关卡"按钮
   - 等待几秒，系统会生成一个新的8×8棋盘
   - 棋盘上会有3个黑色障碍块

3. **手动玩游戏**:
   - 从右侧方块列表选择一个方块（点击）
   - （可选）点击"旋转"按钮旋转方块
   - 点击棋盘上的空格放置方块
   - 重复直到填满所有格子

4. **自动求解**:
   - 点击"求解"按钮
   - 系统会自动计算并填充所有方块
   - 查看解决方案

5. **重置游戏**:
   - 点击"重置"按钮
   - 棋盘恢复到初始状态（保留障碍块）

---

### 🧪 运行测试

```bash
# 运行所有单元测试
cargo test

# 只运行核心逻辑测试
cargo test --lib

# 运行特定测试
cargo test test_solver

# 查看详细输出
cargo test -- --nocapture
```

**预期结果**:
```
running 18 tests
test result: ok. 18 passed; 0 failed
```

---

### 🏗️ 构建发布版

```bash
# 构建优化版本
npm run tauri build

# 生成的可执行文件位置：
# macOS:   src-tauri/target/release/bundle/macos/
# Windows: src-tauri/target/release/bundle/windows/
# Linux:   src-tauri/target/release/bundle/linux/
```

---

## 📚 如何阅读代码

### 🗺️ 项目架构概览

```
逻辑拼图项目
│
├── 核心逻辑层 (logic_core/)      # Rust 纯逻辑库
│   ├── 数据结构
│   ├── 求解器
│   └── 生成器
│
├── Tauri 后端层 (src-tauri/)     # Rust 桌面应用后端
│   └── 命令API
│
└── React 前端层 (src/)           # TypeScript React UI
    ├── 组件
    ├── Hooks
    └── 类型定义
```

---

### 📖 代码阅读路线图

#### 🎯 路线1: 快速了解核心逻辑（30分钟）

**推荐阅读顺序**:

1. **数据结构** - `logic_core/src/types.rs` (300行)
   ```
   关键内容：
   - Color: 方块颜色枚举
   - Piece: 方块结构（id, width, height, color）
   - Board: 8×8棋盘（64个格子）
   - GameState: 游戏状态（board + pieces + used_pieces）
   - Difficulty: 难度枚举（只是标签）
   ```
   **阅读重点**: 第81-215行（Board结构和方法）

2. **方块定义** - `logic_core/src/piece.rs` (100行)
   ```
   关键内容：
   - get_standard_pieces(): 返回固定的11个方块
   - verify_total_area(): 验证总面积=64
   ```
   **阅读重点**: 第9-22行（11个方块定义）

3. **求解器** - `logic_core/src/solver.rs` (150行)
   ```
   关键内容：
   - Solver::solve(): 主求解入口
   - dfs(): DFS回溯核心算法
   ```
   **阅读重点**: 第37-136行（DFS算法）
   **算法流程**:
   ```
   1. 找到第一个空格
   2. 尝试每个未使用的方块
   3. 尝试两种朝向（原始、旋转）
   4. 递归搜索
   5. 回溯
   ```

4. **生成器** - `logic_core/src/generator.rs` (200行)
   ```
   关键内容：
   - generate_from_solution(): 从完整解反推
   - generate_from_obstacles(): 先放障碍再求解
   ```
   **阅读重点**: 第33-96行（两种生成方式）

---

#### 🎯 路线2: 理解前后端交互（20分钟）

**推荐阅读顺序**:

1. **Tauri命令** - `src-tauri/src/commands.rs` (70行)
   ```
   API列表：
   - new_level(difficulty) -> GameState
   - solve_level(state) -> SolveResult
   - check_placement(...) -> bool
   - get_pieces() -> Vec<Piece>
   ```
   **阅读重点**: 每个 #[tauri::command] 函数

2. **Tauri Hook** - `src/hooks/useTauriCommand.ts` (80行)
   ```
   封装了前端调用Tauri命令的逻辑
   处理加载状态和错误
   ```
   **阅读重点**: 每个 useCallback 函数

3. **数据流**:
   ```
   用户点击 → React组件
            ↓
         useTauriCommand.ts (调用 invoke)
            ↓
         Tauri IPC 通信
            ↓
         commands.rs (Rust后端处理)
            ↓
         logic_core (核心算法)
            ↓
         返回结果 → React更新UI
   ```

---

#### 🎯 路线3: 理解 React 前端（30分钟）

**推荐阅读顺序**:

1. **入口文件** - `src/main.tsx` (10行)
   ```
   React应用的启动点
   ```

2. **主应用** - `src/App.tsx` (200行)
   ```
   关键内容：
   - 游戏状态管理
   - 所有事件处理器
   - UI布局
   ```
   **阅读重点**:
   - 第10-21行: 状态和Hooks
   - 第24-33行: handleNewGame（生成新关卡）
   - 第36-67行: handleSolve（自动求解）
   - 第70-100行: handleCellClick（放置方块）

3. **状态管理** - `src/hooks/useGameState.ts` (100行)
   ```
   关键内容：
   - gameState: 当前游戏状态
   - selectedPiece: 选中的方块
   - updateBoard(): 放置方块并判断胜利
   - resetGame(): 重置游戏
   ```
   **阅读重点**: 第8-45行（updateBoard逻辑）

4. **组件**:
   - `src/components/Board.tsx` (70行) - 棋盘渲染
   - `src/components/PieceTray.tsx` (150行) - 方块列表
   - `src/components/Controls.tsx` (80行) - 控制按钮

5. **类型定义** - `src/types/game.ts` (50行)
   ```
   TypeScript类型定义（对应Rust类型）
   ```

---

### 📊 代码地图（按文件大小）

#### 核心逻辑（Rust）
```
logic_core/src/
├── types.rs        (~300行) ⭐⭐⭐ 必读
├── generator.rs    (~230行) ⭐⭐  重要
├── solver.rs       (~150行) ⭐⭐⭐ 核心算法
├── piece.rs        (~100行) ⭐    简单
├── board.rs        (~80行)  ⭐    辅助
└── lib.rs          (~20行)  ⭐    入口
```

#### Tauri后端（Rust）
```
src-tauri/src/
├── commands.rs     (~70行)  ⭐⭐  API定义
├── main.rs         (~20行)  ⭐    启动
└── build.rs        (~3行)   -     构建脚本
```

#### React前端（TypeScript）
```
src/
├── App.tsx                (~200行) ⭐⭐⭐ 主应用
├── hooks/
│   ├── useGameState.ts    (~100行) ⭐⭐  状态管理
│   └── useTauriCommand.ts (~80行)  ⭐⭐  API调用
├── components/
│   ├── PieceTray.tsx      (~150行) ⭐    方块列表
│   ├── Board.tsx          (~70行)  ⭐    棋盘
│   └── Controls.tsx       (~80行)  ⭐    控制栏
├── types/
│   └── game.ts            (~50行)  ⭐⭐  类型定义
└── main.tsx               (~10行)  ⭐    入口
```

---

### 🔍 关键代码片段解析

#### 1. DFS求解器核心（最重要）

**文件**: `logic_core/src/solver.rs:74-133`

```rust
// 尝试每个未使用的方块
for i in 0..pieces.len() {
    if used[i] { continue; }

    // 尝试两种朝向
    for rotation in 0..2 {
        if rotation == 1 {
            pieces[i].rotate();  // 旋转90度
        }

        // 检查是否可以放置
        if board.can_place(&pieces[i], row, col) {
            // 放置
            board.place(&pieces[i], row, col);
            used[i] = true;

            // 递归搜索
            if self.dfs(board, pieces, used, solutions, placements) {
                return true;  // 找到足够多的解
            }

            // 回溯
            board.remove(&pieces[i], row, col);
            used[i] = false;
        }

        if rotation == 1 {
            pieces[i].rotate();  // 恢复朝向
        }
    }
}
```

**理解要点**:
- 按"第一个空格"顺序填充（从左到右、从上到下）
- 每个方块尝试2种朝向（除了正方形）
- 递归+回溯是经典的DFS模式

---

#### 2. 关卡生成器核心

**文件**: `logic_core/src/generator.rs:98-120`

```rust
fn generate_complete_solution(&self) -> Option<Solution> {
    let mut rng = rand::rng();
    let mut pieces = get_standard_pieces();

    // 随机打乱方块顺序，增加多样性
    pieces.shuffle(&mut rng);

    // 随机旋转某些方块
    for piece in &mut pieces {
        if rng.random_bool(0.3) && piece.width != piece.height {
            piece.rotate();
        }
    }

    // 用求解器生成完整解
    let state = GameState::new(pieces);
    let solver = Solver::new(1);
    match solver.solve(&state) {
        SolveResult::UniqueSolution(solution) => Some(solution),
        SolveResult::MultipleSolutions(mut solutions) => solutions.pop(),
        SolveResult::NoSolution => None,
    }
}
```

**理解要点**:
- 通过随机化增加关卡多样性
- 复用求解器生成完整解
- 30%概率旋转非正方形方块

---

#### 3. React状态管理

**文件**: `src/hooks/useGameState.ts:8-45`

```typescript
const updateBoard = useCallback((row: number, col: number, piece: Piece): boolean => {
  let isWin = false;

  setGameState((prev) => {
    if (!prev) return null;

    const newCells = [...prev.board.cells];  // 复制数组

    // 放置方块
    for (let r = 0; r < piece.height; r++) {
      for (let c = 0; c < piece.width; c++) {
        const index = (row + r) * 8 + (col + c);
        newCells[index] = piece.id;
      }
    }

    // 标记为已使用
    const newUsedPieces = [...prev.used_pieces];
    newUsedPieces[pieceIndex] = true;

    // ⭐ 关键：基于新数据判断胜利
    isWin = newCells.every((cell) => cell !== 0);

    return { ...prev, board: { cells: newCells }, used_pieces: newUsedPieces };
  });

  return isWin;  // ⭐ 返回胜利状态
}, []);
```

**理解要点**:
- React状态不可变更新（复制数组）
- 在setGameState内部判断胜利（使用新数据）
- 返回胜利状态给调用方

---

### 📂 代码阅读建议

#### 新手路线：从简单到复杂

```
第1天：理解数据结构
1. types.rs (了解Piece、Board、GameState)
2. piece.rs (看11个方块定义)
3. 运行测试：cargo test piece

第2天：理解求解器
1. solver.rs (重点看DFS算法)
2. 手动追踪一个简单案例
3. 运行测试：cargo test solver

第3天：理解生成器
1. generator.rs (两种生成方式)
2. 理解为什么需要验证唯一解
3. 运行测试：cargo test generator

第4天：理解前后端交互
1. commands.rs (Tauri API)
2. useTauriCommand.ts (前端调用)
3. 追踪一次完整的"生成关卡"流程

第5天：理解React UI
1. App.tsx (主应用逻辑)
2. useGameState.ts (状态管理)
3. 各个组件文件
```

---

#### 高级路线：按功能模块

```
功能1：生成新关卡
前端: App.tsx::handleNewGame (L24-33)
    → useTauriCommand.ts::newLevel (L9-22)
后端: commands.rs::new_level (L9-20)
    → generator.rs::generate (L25-30)
    → generator.rs::generate_from_solution (L33-54)
    → solver.rs::solve (L25-35)

功能2：放置方块
前端: App.tsx::handleCellClick (L70-100)
    → useTauriCommand.ts::checkPlacement (L39-62)
后端: commands.rs::check_placement (L48-60)
    → board.rs::can_place (types.rs L147-161)
前端: useGameState.ts::updateBoard (L8-45)

功能3：自动求解
前端: App.tsx::handleSolve (L36-67)
    → useTauriCommand.ts::solveLevel (L24-37)
后端: commands.rs::solve_level (L41-44)
    → solver.rs::solve (L25-35)
    → solver.rs::dfs (L37-136)
```

---

### 🔬 调试技巧

#### Rust后端调试

```bash
# 1. 查看println输出
cargo run 2>&1 | grep "DEBUG"

# 2. 使用棋盘打印功能
# 在代码中添加：
board.print();  // logic_core/src/board.rs:22

# 3. 使用Rust调试器
rust-lldb target/debug/logic-puzzle-app
```

#### 前端调试

```bash
# 1. 浏览器开发者工具
# 启动应用后按 F12 或 Cmd+Option+I

# 2. 查看console.log
console.log('GameState:', gameState);

# 3. React DevTools
# 安装 React DevTools 浏览器扩展
```

---

### 📝 关键数据结构速查

#### Board（棋盘）
```rust
cells: [i8; 64]  // 一维数组表示8×8棋盘
// 索引计算：index = row * 8 + col
// 值含义：
//   -1 = 障碍块
//    0 = 空格
//  1-11 = 对应piece_id
```

#### Piece（方块）
```rust
struct Piece {
    id: u8,              // 1-11
    width: usize,        // 当前宽度
    height: usize,       // 当前高度
    original_width: usize,   // 原始宽度
    original_height: usize,  // 原始高度
    color: Color,        // 颜色
    rotated: bool,       // 是否旋转
}
```

#### 11个方块尺寸表
```
ID  尺寸   颜色   面积
1   1×1   黑色    1
2   1×2   黑色    2
3   1×3   黑色    3
4   1×4   蓝色    4
5   1×5   蓝色    5
6   2×2   红色    4
7   2×3   红色    6
8   2×4   黄色    8
9   2×5   黄色   10
10  3×3   灰色    9
11  3×4   灰色   12
-------------------
总计              64  ✅ 正好填满8×8棋盘
```

---

### 🎓 学习建议

#### 如果你想学习 Rust
**重点看**:
- `logic_core/` - 纯Rust逻辑
- 数据结构设计
- DFS回溯算法实现
- 测试编写

**练习**:
- 修改求解器添加启发式优化
- 实现新的生成算法
- 添加更多单元测试

---

#### 如果你想学习 Tauri
**重点看**:
- `src-tauri/src/commands.rs` - 命令定义
- `src-tauri/src/main.rs` - 应用入口
- 前后端IPC通信

**练习**:
- 添加新的Tauri命令
- 实现前端调用
- 理解序列化/反序列化

---

#### 如果你想学习 React + TypeScript
**重点看**:
- `src/App.tsx` - 主应用
- `src/hooks/` - 自定义Hooks
- `src/types/game.ts` - 类型系统

**练习**:
- 添加新的React组件
- 实现更多游戏功能（撤销/重做）
- 优化UI和交互

---

### 🐛 常见问题

#### Q: 编译失败 "edition 2024 requires rust 1.85+"
```bash
# 更新 Rust 到最新版
rustup update stable
rustc --version  # 应该 >= 1.85
```

#### Q: npm install 失败
```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm install
```

#### Q: 应用窗口无法打开
```bash
# 检查前端开发服务器是否运行
# 应该在 http://localhost:5173
curl http://localhost:5173
```

#### Q: 方块无法放置
- ✅ 已在本次修复中解决（Tauri参数命名问题）
- 确保使用最新代码

---

### 📚 推荐学习资源

**Rust**:
- [Rust官方书](https://doc.rust-lang.org/book/)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/)

**Tauri**:
- [Tauri官方文档](https://tauri.app/v2/)
- [Tauri命令系统](https://tauri.app/v2/guides/features/command/)

**React**:
- [React官方文档](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)

**TypeScript**:
- [TypeScript官方文档](https://www.typescriptlang.org/docs/)

---

### 🎯 快速参考

```bash
# 开发
npm run tauri dev          # 启动开发模式
npm run dev                # 只启动前端
cargo run                  # 只启动后端（需cd src-tauri）

# 测试
cargo test                 # 运行所有测试
cargo test --lib           # 只测核心逻辑
cargo test solver          # 测试求解器

# 构建
npm run build              # 构建前端
cargo build --release      # 构建后端（优化版）
npm run tauri build        # 构建完整应用

# 检查
cargo check --workspace    # 检查代码编译
cargo clippy               # Rust代码规范检查
npm run build              # TypeScript类型检查
```

---

### 📞 获取帮助

- **项目文档**: 查看 `PROJECT.md` 详细说明
- **升级日志**: 查看 `UPGRADE.md` 了解技术栈
- **Bug修复**: 查看 `BUGFIX.md` 了解已修复问题
- **安全性**: 查看 `SECURITY.md` 了解安全改进

---

**祝您阅读愉快！** 🎉
