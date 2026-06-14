import { MenuItemConstructorOptions } from 'electron'

export type MenuSection = (isMac: boolean) => MenuItemConstructorOptions[]
