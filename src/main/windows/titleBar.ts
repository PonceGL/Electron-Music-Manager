import { BrowserWindowConstructorOptions } from 'electron'

export function getTitleBarOptions(): Partial<BrowserWindowConstructorOptions> {
  if (process.platform !== 'darwin') return {}
  return { titleBarStyle: 'hiddenInset' }
}
