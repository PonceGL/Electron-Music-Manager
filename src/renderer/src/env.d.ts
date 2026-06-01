/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

interface Window {
  electronAPI: {
    platform: string
  }
}
