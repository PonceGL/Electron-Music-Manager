import { autoUpdater } from 'electron-updater'

const UPDATE_CHECK_DELAY_MS = 5_000

export function initAutoUpdater(): void {
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(console.error)
  }, UPDATE_CHECK_DELAY_MS)
}
