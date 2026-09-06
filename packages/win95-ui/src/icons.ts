/**
 * Typed icon catalog. Only icons the site actually uses are exported here, so the
 * Phase 3 studio can enumerate exactly what the brand is built from.
 * Every entry is an @react95/icons component; render with variant="32x32_4" or "16x16_4".
 */
import { Computer3, Folder, Notepad2, Mplayer113, Explorer100, Mshtml32528 } from '@react95/icons'

export const Icons = {
  MyComputer: Computer3,
  Folder,
  Notepad: Notepad2,
  MediaPlayer: Mplayer113,
  Explorer: Explorer100,
  Web: Mshtml32528,
} as const

export type IconName = keyof typeof Icons
