import { autoUpdater } from 'electron-updater'

export function initAutoUpdater(): void {
  autoUpdater.checkForUpdatesAndNotify()
}
