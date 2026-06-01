import { BrowserWindowConstructorOptions } from 'electron'

export function getTitleBarOptions(): Partial<BrowserWindowConstructorOptions> {
  const isMac = process.platform === 'darwin'
  return {
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    titleBarOverlay: isMac ? false : { color: '#1a1a2e', symbolColor: '#eee', height: 32 }
  }
}
