import { app } from 'electron'
import { menuActions } from '../actions/registry'
import { MenuSection } from '../types'

export const appSection: MenuSection = (isMac) => {
  if (!isMac) return []

  return [
    {
      label: app.getName(),
      submenu: [
        {
          label: `About ${app.getName()}`,
          click: menuActions.openAboutWindow
        },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }
  ]
}
