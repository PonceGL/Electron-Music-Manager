import { app, nativeTheme } from 'electron'
import { initAutoUpdater } from './updater'
import { buildMenu } from './menu'
import { createMainWindow } from './windows/main/createMainWindow'

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark'
  buildMenu()
  createMainWindow()
  if (app.isPackaged) initAutoUpdater()
})

app.on('window-all-closed', () => {
  app.quit()
})
