import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getAppInfo: () => ipcRenderer.invoke('get-app-info')
})
