import { Menu, MenuItemConstructorOptions } from 'electron'
import { appSection } from './sections/app.section'
import { fileSection } from './sections/file.section'
import { editSection } from './sections/edit.section'
import { viewSection } from './sections/view.section'
import { windowSection } from './sections/window.section'
import { helpSection } from './sections/help.section'
import { MenuSection } from './types'

const sections: MenuSection[] = [
  appSection,
  fileSection,
  editSection,
  viewSection,
  windowSection,
  helpSection
]

export function resolveMenu(): Menu {
  const isMac = process.platform === 'darwin'
  const template: MenuItemConstructorOptions[] = sections.flatMap((section) => section(isMac))
  return Menu.buildFromTemplate(template)
}
