import { BrowserWindow, app } from 'electron'
import { join } from 'path'
import { getTitleBarOptions } from '../titleBar'

const DESCRIPTION = 'A music manager desktop app built with Electron'

let aboutWindow: BrowserWindow | null = null

export function openAboutWindow(): void {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.focus()
    return
  }

  aboutWindow = new BrowserWindow({
    width: 420,
    height: 280,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    backgroundColor: '#1a1a2e',
    title: `About ${app.getName()}`,
    ...getTitleBarOptions(),
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  aboutWindow.setMenu(null)
  aboutWindow.on('ready-to-show', () => aboutWindow?.show())

  const query = {
    name: app.getName(),
    version: app.getVersion(),
    description: DESCRIPTION
  }

  if (process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL(`${process.env['ELECTRON_RENDERER_URL']}/about.html`)
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v))
    aboutWindow.loadURL(url.toString())
  } else {
    aboutWindow.loadFile(join(__dirname, '../renderer/about.html'), { query })
  }

  aboutWindow.on('closed', () => {
    aboutWindow = null
  })
}
