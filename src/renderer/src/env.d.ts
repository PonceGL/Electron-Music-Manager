/// <reference types="vite/client" />

import type { ElectronAPI } from '../../preload'

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
