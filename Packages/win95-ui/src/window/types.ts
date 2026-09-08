import type { ReactElement, ReactNode } from 'react'

export type Rect = { x: number; y: number; width: number; height: number }
export type Size = { width: number; height: number }

/** Where a drag will drop the window. 'top' is Windows' gesture for maximize. */
export type SnapZone = 'left' | 'right' | 'top'

/** How the window is currently laid out. Only 'floating' uses the window's own rect. */
export type WindowLayout = 'floating' | 'left' | 'right' | 'maximized'

/** Everything the app supplies to open a window. */
export interface WindowSpec {
  id: string
  title: string
  icon?: ReactElement
  content: ReactNode
  /** Missing fields fall back to a size default and a cascading position. */
  initialRect?: Partial<Rect>
  /**
   * How the window opens. Defaults to floating.
   *
   * Separate from initialRect rather than folded into it, because the two are not alternatives:
   * a window that opens maximized still needs a floating rectangle to restore down to, and that
   * is what initialRect keeps holding. Both are supplied when a window is reopened at a size and
   * a layout it was left in.
   */
  initialLayout?: WindowLayout
  minWidth?: number
  minHeight?: number
  resizable?: boolean
  /** Extra data attributes for the tutorial and the inspector, e.g. { tutorial: 'about-window' }. */
  data?: Record<string, string>
}

export interface WindowState extends WindowSpec {
  /** Floating geometry. Preserved through snaps and maximize so restore goes back to it. */
  rect: Rect
  layout: WindowLayout
  minimized: boolean
  z: number
}
