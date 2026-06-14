import { MenuSection } from '../types'

export const viewSection: MenuSection = () => [
  {
    label: 'View',
    submenu: [
      { role: 'reload' as const },
      { role: 'forceReload' as const },
      { role: 'toggleDevTools' as const },
      { type: 'separator' as const },
      { role: 'togglefullscreen' as const }
    ]
  }
]
