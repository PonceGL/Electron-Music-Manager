import { app, BrowserWindow, shell, nativeTheme } from 'electron'
import { join } from 'path'
import { initAutoUpdater } from './updater'
import { buildMenu } from './menu'
import { getTitleBarOptions } from './windows/titleBar'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    show: false,
    backgroundColor: '#1a1a2e',
    ...getTitleBarOptions(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark'
  buildMenu()
  createWindow()
  if (app.isPackaged) initAutoUpdater()
})

app.on('window-all-closed', () => {
  app.quit()
})
