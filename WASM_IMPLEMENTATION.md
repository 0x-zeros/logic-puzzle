# WASM版本实现完成指南

## ✅ 已完成部分

### 1. WASM配置和编译 ✅

**已完成**：
- ✅ 配置 `logic_core/Cargo.toml` 支持WASM
- ✅ 创建 `logic_core/src/wasm.rs` 绑定层
- ✅ 配置 `logic_core/.cargo/config.toml`
- ✅ 编译成功生成 `src/wasm/logic_core_bg.wasm` (116KB)

**生成的文件**：
```
src/wasm/
├── logic_core.js          # JS绑定代码
├── logic_core_bg.wasm     # WASM二进制（116KB）
├── logic_core.d.ts        # TypeScript类型
└── package.json
```

---

## 🚧 待完成部分

### 2. 创建 useWasmCommand Hook

创建文件：`src/hooks/useWasmCommand.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';
import type { GameState, SolveResponse, Piece, Difficulty, ValidationResult } from '../types/game';

// 导入WASM模块
import init, { WasmPuzzle } from '../wasm/logic_core';

export function useWasmCommand() {
  const [puzzle, setPuzzle] = useState<WasmPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化WASM
  useEffect(() => {
    init().then(() => {
      console.log('✅ WASM模块初始化成功');
      setPuzzle(new WasmPuzzle());
    }).catch((err) => {
      console.error('❌ WASM初始化失败:', err);
      setError('WASM初始化失败');
    });
  }, []);

  const newLevel = useCallback(
    async (difficulty: Difficulty): Promise<GameState | null> => {
      if (!puzzle) return null;
      setLoading(true);
      setError(null);
      try {
        const state = puzzle.newLevel(difficulty);
        return state as GameState;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [puzzle]
  );

  const solveLevel = useCallback(
    async (state: GameState): Promise<SolveResponse | null> => {
      if (!puzzle) return null;
      setLoading(true);
      setError(null);
      try {
        const result = puzzle.solveLevel(state);
        return result as SolveResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [puzzle]
  );

  const checkPlacement = useCallback(
    async (
      boardCells: number[],
      pieceId: number,
      row: number,
      col: number,
      rotated: boolean
    ): Promise<boolean> => {
      if (!puzzle) return false;
      try {
        // WASM需要i8数组
        const cells = new Int8Array(boardCells);
        return puzzle.checkPlacement(Array.from(cells), pieceId, row, col, rotated);
      } catch (err) {
        console.error('Check placement error:', err);
        return false;
      }
    },
    [puzzle]
  );

  const getPieces = useCallback(async (): Promise<Piece[]> => {
    if (!puzzle) return [];
    try {
      const pieces = puzzle.getPieces();
      return pieces as Piece[];
    } catch (err) {
      console.error('Get pieces error:', err);
      return [];
    }
  }, [puzzle]);

  const validateCustomObstacles = useCallback(
    async (boardCells: number[]): Promise<ValidationResult | null> => {
      if (!puzzle) return null;
      setLoading(true);
      setError(null);
      try {
        const cells = new Int8Array(boardCells);
        const result = puzzle.validateCustomObstacles(Array.from(cells));
        return result as ValidationResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [puzzle]
  );

  return {
    loading,
    error,
    newLevel,
    solveLevel,
    checkPlacement,
    getPieces,
    validateCustomObstacles,
  };
}
```

---

### 3. 修改 App.tsx 支持WASM

**找到这一行**：
```typescript
import { useTauriCommand } from './hooks/useTauriCommand';
```

**替换为**：
```typescript
import { useWasmCommand } from './hooks/useWasmCommand';
```

**找到这一行**：
```typescript
const { loading, error, newLevel, ... } = useTauriCommand();
```

**替换为**：
```typescript
const { loading, error, newLevel, ... } = useWasmCommand();
```

**就这两处改动！其余代码完全不变。**

---

### 4. 配置 Vite 支持 WASM

**修改 `vite.config.ts`**：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm';  // 需要安装

export default defineConfig({
  plugins: [
    react(),
    wasm(),  // 添加WASM插件
  ],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..'],  // 允许访问父目录（WASM文件）
    },
  },
  optimizeDeps: {
    exclude: ['logic_core'],  // 不要预打包WASM
  },
})
```

**安装vite-plugin-wasm**：
```bash
npm install -D vite-plugin-wasm vite-plugin-top-level-await
```

**或者不用插件**（Vite 5+原生支持）：
```typescript
// vite.config.ts 保持简单配置即可
export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] },
  },
})
```

---

### 5. 测试WASM版本

```bash
# 确保在项目根目录
cd /Users/zero/dev/game/logic-puzzle

# 运行开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173
```

**预期效果**：
- ✅ 控制台显示"✅ WASM模块初始化成功"
- ✅ 所有游戏功能正常工作
- ✅ 无需Tauri，纯Web浏览器运行

---

### 6. 部署到Web

**Vercel部署**（推荐）：
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

**配置 `vercel.json`**：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**或者GitHub Pages**：
```bash
# 1. 构建
npm run build

# 2. 提交dist到gh-pages分支
git checkout -b gh-pages
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

---

## 📊 WASM vs Tauri 对比

| 特性 | Tauri版本 | WASM版本 |
|------|-----------|----------|
| 运行方式 | 桌面应用 | Web浏览器 |
| 安装要求 | 需要下载安装 | 无需安装 |
| 文件大小 | ~8MB | 116KB WASM |
| 启动速度 | 快 | 快（首次需加载） |
| 离线支持 | ✅ | ✅ (PWA) |
| 分享方式 | 发送exe/dmg | 发送链接 |
| 更新方式 | 需要重新安装 | 自动更新 |
| 成本 | $0 | $0 |

---

## 🔄 两个版本共存

**自动检测环境**：

```typescript
// src/hooks/useCommand.ts
import { useTauriCommand } from './useTauriCommand';
import { useWasmCommand } from './useWasmCommand';

export function useCommand() {
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  if (isTauri) {
    console.log('🖥️ 使用Tauri版本（桌面应用）');
    return useTauriCommand();
  } else {
    console.log('🌐 使用WASM版本（Web浏览器）');
    return useWasmCommand();
  }
}
```

**在 App.tsx 中**：
```typescript
import { useCommand } from './hooks/useCommand';

// 自动选择合适的版本
const { loading, error, newLevel, ... } = useCommand();
```

---

## ⏱️ 剩余工作量

- 创建 `useWasmCommand.ts`：30分钟
- 修改 `App.tsx` 引入：5分钟
- 测试WASM功能：30分钟
- 配置Vite（可选）：10分钟
- 部署到Vercel：10分钟

**总计：约1-1.5小时即可完成Web版本！**

---

## 🎯 下一步

**选项1：纯WASM版本**
- 替换所有 useTauriCommand 为 useWasmCommand
- 移除Tauri依赖（可选）

**选项2：双版本支持**（推荐）
- 创建 useCommand 自动检测
- 同时支持桌面和Web

**请告诉我您想要哪种方式？我立即继续实现！**
