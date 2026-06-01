import { BrowserWindow, app } from 'electron'
import { join } from 'path'

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
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  aboutWindow.on('ready-to-show', () => aboutWindow?.show())

  if (process.env['ELECTRON_RENDERER_URL']) {
    aboutWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/about.html`)
  } else {
    aboutWindow.loadFile(join(__dirname, '../../renderer/about.html'))
  }

  aboutWindow.on('closed', () => {
    aboutWindow = null
  })
}
