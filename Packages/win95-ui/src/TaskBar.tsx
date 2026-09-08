import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button, Frame } from '@react95/core'
import { Logo } from '@react95/icons'
import { TASKBAR_HEIGHT } from './constants'
import { useWindowManager } from './window/WindowManager'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  const text = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return (
    <Frame boxShadow="$in" className="flex h-[22px] items-center px-2 text-[11px]" data-dg="clock">
      {text}
    </Frame>
  )
}

/**
 * Our taskbar rather than React95's, because React95's reads its window list from its own
 * Modal event bus and we no longer use Modal. Start button, one button per window, a clock.
 * `startMenu` is whatever the app wants in the popup, usually a React95 <List>.
 */
export function TaskBar({ startMenu, tray }: { startMenu: ReactNode; tray?: ReactNode }) {
  const wm = useWindowManager()
  const { startMenuOpen, setStartMenuOpen } = wm
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startMenuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setStartMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [startMenuOpen, setStartMenuOpen])

  return (
    <div
      ref={rootRef}
      data-dg="taskbar"
      className="absolute inset-x-0 bottom-0"
      style={{ zIndex: 1_000_000 }}
    >
      {startMenuOpen && (
        <Frame
          boxShadow="$out"
          bgColor="$material"
          className="absolute bottom-full left-0 mb-[1px] p-[2px]"
          data-dg="start-menu"
          data-tutorial="start-menu"
          onClick={() => setStartMenuOpen(false)}
        >
          {startMenu}
        </Frame>
      )}
      <Frame
        boxShadow="$out"
        bgColor="$material"
        className="flex items-center gap-1 px-1"
        style={{ height: TASKBAR_HEIGHT, borderTop: '1px solid var(--r95-color-borderLighter)' }}
      >
        <Button
          className="flex h-[22px] items-center gap-1 px-1 font-bold"
          // React95's Button has no `active` prop -- it forwards unknown props to the DOM, so
          // `active` became an invalid HTML attribute (console warning) and never rendered a
          // pressed state. boxShadow="$in" is how a React95 Frame shows depressed.
          boxShadow={startMenuOpen ? '$in' : '$out'}
          aria-expanded={startMenuOpen}
          data-tutorial="start-button"
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <Logo variant="16x16_4" />
          Start
        </Button>
        <div className="mx-1 h-[22px] w-[2px]" style={{ boxShadow: 'var(--r95-shadow-in)' }} />
        <div
          className="flex min-w-0 flex-1 gap-[3px] overflow-hidden"
          data-tutorial="taskbar-windows"
        >
          {wm.windows.map((w) => {
            const active = wm.activeId === w.id && !w.minimized
            return (
              <Button
                key={w.id}
                boxShadow={active ? '$in' : '$out'}
                aria-pressed={active}
                className="flex h-[22px] max-w-[160px] min-w-0 flex-1 items-center gap-1 px-1 text-left"
                data-dg-taskbar-window={w.id}
                onClick={() => (active ? wm.minimize(w.id) : wm.restore(w.id))}
              >
                {w.icon}
                <span className="truncate">{w.title}</span>
              </Button>
            )
          })}
        </div>
        {tray}
        <Clock />
      </Frame>
    </div>
  )
}
