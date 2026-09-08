import type { ComponentType } from 'react'
import {
  Amovie2,
  Charmap1,
  Chatshow3000,
  Computer3,
  FileFind,
  Folder,
  FolderOpen,
  Globe,
  Joy102,
  Mail,
  Mplayer113,
  Mspaint,
  Notepad2,
  Phone2,
} from '@react95/icons'

/**
 * The two sizes the site uses: 32px on the desktop, 16px in title bars, lists and menus.
 * React95 icons do not all ship both (Ie is 16x16_8 only; Phone is 32x32_4 only), which is
 * why the catalog below is typed explicitly.
 *
 * The type is a weaker guarantee than it looks, so do not trust it alone. It only checks that
 * a component accepts a `variant` prop; it cannot see whether artwork exists behind that
 * variant. Joy108 typechecked fine and rendered an empty <svg> on the desktop. When adding an
 * icon, look at it in the browser at both sizes.
 */
export type IconVariant = '32x32_4' | '16x16_4'
export type IconComponent = ComponentType<{ variant?: IconVariant }>

export type IconName =
  | 'MyComputer'
  | 'Folder'
  | 'FolderOpen'
  | 'Notepad'
  | 'Browser'
  | 'Email'
  | 'Phone'
  | 'Videos'
  | 'ClipMaker'
  | 'AssetStudio'
  | 'Games'
  | 'GameShow'
  | 'Letters'
  | 'Investigate'

/**
 * Typed icon catalog. Only icons the site actually uses are exported here, so the Phase 3
 * studio can enumerate exactly what the brand is built from, and so tree-shaking has a
 * single small surface to keep out of the 975 available.
 */
export const Icons: Record<IconName, IconComponent> = {
  MyComputer: Computer3,
  Folder,
  FolderOpen,
  Notepad: Notepad2,
  /** The internet. The About window is an old browser, so this is its icon. */
  Browser: Globe,
  Email: Mail,
  Phone: Phone2,
  /** Media Player: the Videos window. */
  Videos: Mplayer113,
  /** ActiveMovie film strip: the Clip Maker project. */
  ClipMaker: Amovie2,
  /** Paint: the Windows 95 asset studio project. */
  AssetStudio: Mspaint,
  /**
   * Joystick, the Windows 95 Games folder icon.
   *
   * Joy102, not Joy108: Joy108 exports a 32x32_4 that renders an empty <svg> with no paths
   * (224 bytes of function body against ~3000 for a real icon), so the Games shortcut showed a
   * label with blank space above it. Verified in the browser, not inferred.
   */
  Games: Joy102,
  /** A talk-show set. Used for the Jeopardy board. */
  GameShow: Chatshow3000,
  /** Character Map: letters on a grid. Used for the Spelling Bee. */
  Letters: Charmap1,
  /** Magnifying glass over a document. Used for the murder mystery. */
  Investigate: FileFind,
}
