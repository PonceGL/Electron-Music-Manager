/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

interface AppInfo {
  name: string
  version: string
  description: string
}

interface Window {
  electronAPI: {
    platform: string
    getAppInfo: () => Promise<AppInfo>
  }
}
