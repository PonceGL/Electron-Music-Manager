import { MenuSection } from '../types'

export const windowSection: MenuSection = (isMac) => [
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' as const },
      { role: 'zoom' as const },
      ...(isMac
        ? [{ type: 'separator' as const }, { role: 'front' as const }]
        : [{ role: 'close' as const }])
    ]
  }
]
