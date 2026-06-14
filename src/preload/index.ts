import { contextBridge } from 'electron'

const api = {
  platform: process.platform
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('electronAPI', api)
