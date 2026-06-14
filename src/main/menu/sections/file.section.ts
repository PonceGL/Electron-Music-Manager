import { MenuSection } from '../types'

export const fileSection: MenuSection = (isMac) => [
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' as const } : { role: 'quit' as const }]
  }
]
