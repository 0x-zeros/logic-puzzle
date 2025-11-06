import { useTauriCommand } from './useTauriCommand';
import { useWasmCommand } from './useWasmCommand';

/**
 * 自动检测环境并使用合适的命令hook
 * - Tauri环境：使用Tauri IPC（桌面应用）
 * - Web环境：使用WASM（浏览器）
 */
export function useCommand() {
  // 检测是否在Tauri环境中
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  if (isTauri) {
    console.log('🖥️  检测到Tauri环境，使用桌面版API');
    return useTauriCommand();
  } else {
    console.log('🌐 检测到Web环境，使用WASM版本');
    return useWasmCommand();
  }
}
