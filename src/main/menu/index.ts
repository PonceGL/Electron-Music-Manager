import { Menu } from 'electron'
import { resolveMenu } from './resolveMenu'

export function buildMenu(): void {
  Menu.setApplicationMenu(resolveMenu())
}
