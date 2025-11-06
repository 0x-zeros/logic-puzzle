import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/logic-puzzle/' : '/',
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
    fs: {
      allow: ['..'],  // 允许访问WASM文件
    },
  },
  build: {
    target: 'esnext',  // 支持现代浏览器特性
  },
})
