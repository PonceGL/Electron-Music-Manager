import { app } from 'electron'
import { menuActions } from '../actions/registry'
import { MenuSection } from '../types'

export const helpSection: MenuSection = (isMac) => [
  {
    role: 'help' as const,
    submenu: [
      ...(!isMac
        ? [
            {
              label: `About ${app.getName()}`,
              click: menuActions.openAboutWindow
            },
            { type: 'separator' as const }
          ]
        : [])
    ]
  }
]
