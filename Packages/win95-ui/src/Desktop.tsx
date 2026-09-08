import type { ReactNode } from 'react'
import { TASKBAR_HEIGHT } from './constants'
import { useWindowManager } from './window/WindowManager'

/**
 * The class react-rnd is pointed at for its drag and resize bounds. It is a real element
 * rather than the string "parent" because "parent" is the whole desktop, taskbar included,
 * and a window dragged to the bottom would slide underneath it.
 */
export const WORK_AREA_CLASS = 'dg-work-area'

/**
 * The desktop surface. Fills whatever contains it (the CRT bezel decides the size), owns the
 * teal, and is the positioning parent every window and the taskbar sit inside. Clicking the
 * bare desktop deactivates the current window, like the real thing.
 */
export function Desktop({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { desktopRef, blur } = useWindowManager()
  return (
    <div
      ref={desktopRef}
      data-dg="desktop"
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: 'var(--dg-desktop-bg)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) blur()
      }}
    >
      {/* The work area: everything above the taskbar. Nothing but geometry — it paints
          nothing and catches nothing — but windows are bounded by it, so the taskbar is a
          floor rather than something to slide under. */}
      <div
        aria-hidden
        className={`${WORK_AREA_CLASS} pointer-events-none absolute top-0 left-0 right-0`}
        style={{ bottom: TASKBAR_HEIGHT, zIndex: 0 }}
      />
      {children}
    </div>
  )
}
