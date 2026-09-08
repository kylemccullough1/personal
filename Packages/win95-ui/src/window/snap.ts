import { SNAP_THRESHOLD } from '../constants'
import type { Rect, Size, SnapZone, WindowLayout } from './types'

/**
 * Decide whether a pointer position, in client coordinates, is close enough to an edge of
 * the desktop to snap. Top wins over the sides so dragging into a corner maximizes, which is
 * what Windows does.
 */
export function detectSnapZone(
  clientX: number,
  clientY: number,
  desktop: DOMRect,
  threshold = SNAP_THRESHOLD,
): SnapZone | null {
  if (clientY - desktop.top <= threshold) return 'top'
  if (clientX - desktop.left <= threshold) return 'left'
  if (desktop.right - clientX <= threshold) return 'right'
  return null
}

export function layoutForZone(zone: SnapZone): WindowLayout {
  return zone === 'top' ? 'maximized' : zone
}

/** The rectangle a window occupies for a given layout, relative to the desktop's top-left. */
export function rectForLayout(layout: WindowLayout, workArea: Size, floating: Rect): Rect {
  const half = Math.floor(workArea.width / 2)
  switch (layout) {
    case 'maximized':
      return { x: 0, y: 0, width: workArea.width, height: workArea.height }
    case 'left':
      return { x: 0, y: 0, width: half, height: workArea.height }
    case 'right':
      return { x: half, y: 0, width: workArea.width - half, height: workArea.height }
    default:
      return floating
  }
}
