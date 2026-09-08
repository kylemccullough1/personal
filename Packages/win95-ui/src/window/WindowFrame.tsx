import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { Rnd, type RndDragCallback, type RndResizeCallback } from 'react-rnd'
import { Frame, TitleBar } from '@react95/core'
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from '../constants'
import { WORK_AREA_CLASS } from '../Desktop'
import { detectSnapZone, rectForLayout } from './snap'
import type { Rect, Size, WindowState } from './types'
import { useWindowManager } from './WindowManager'

const TITLEBAR_HANDLE = 'dg-window-titlebar'

/** Pointer travel, in px, before a title-bar press on a maximized window counts as a drag. */
const DRAG_THRESHOLD = 4

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

/** react-rnd hands us mouse or touch events; normalise to one client point. */
function pointerFrom(e: unknown): { x: number; y: number } | null {
  const ev = e as {
    clientX?: number
    clientY?: number
    changedTouches?: TouchList
    touches?: TouchList
  }
  const touch = ev.changedTouches?.[0] ?? ev.touches?.[0]
  if (touch) return { x: touch.clientX, y: touch.clientY }
  if (typeof ev.clientX === 'number' && typeof ev.clientY === 'number') {
    return { x: ev.clientX, y: ev.clientY }
  }
  return null
}

/**
 * The floating rectangle a maximized or snapped window restores to when its title bar is
 * grabbed at desktop x-coordinate px. Windows keeps the pointer at the same fraction across
 * the title bar, so the window appears to shrink around the hand holding it; the top edge
 * stays where it was so the title bar stays under the pointer vertically too.
 */
function restoredUnderPointer(current: Rect, floating: Rect, px: number, area: Size): Rect {
  const fraction = current.width > 0 ? (px - current.x) / current.width : 0.5
  return {
    x: clamp(px - fraction * floating.width, 0, area.width - floating.width),
    y: clamp(current.y, 0, area.height - floating.height),
    width: floating.width,
    height: floating.height,
  }
}

/**
 * One window. Geometry comes from react-rnd (drag and eight-way resize, touch included);
 * chrome comes from React95's Frame and TitleBar; state lives in the window manager.
 *
 * react-rnd only drags floating windows. A maximized or snapped window instead restores the
 * moment its title bar is pressed and, if the pointer keeps moving, is carried by the tear-off
 * handler below for the rest of that gesture. Resizing a half-snapped window is allowed and
 * floats it, which is what Windows does.
 */
export function WindowFrame({ win }: { win: WindowState }) {
  const wm = useWindowManager()
  const isActive = wm.activeId === win.id
  const isFloating = win.layout === 'floating'
  const isMaximized = win.layout === 'maximized'
  const rect = rectForLayout(win.layout, wm.workArea, win.rect)

  const onDrag: RndDragCallback = (e) => {
    const desktop = wm.desktopRef.current?.getBoundingClientRect()
    const p = pointerFrom(e)
    wm.setSnapPreview(desktop && p ? detectSnapZone(p.x, p.y, desktop) : null)
  }

  /**
   * Keep a rectangle inside the work area.
   *
   * react-rnd's own bounds hold perfectly *during* a drag, and then hand back an unbounded
   * final position on release — drag a window hard at the taskbar and it stays put while the
   * mouse is down, then jumps under it the moment you let go. Since this component owns the
   * geometry that gets written, the honest place to enforce the floor is here, on the way in.
   */
  const contain = (r: { x: number; y: number; width: number; height: number }) => ({
    x: clamp(r.x, 0, Math.max(0, wm.workArea.width - r.width)),
    y: clamp(r.y, 0, Math.max(0, wm.workArea.height - r.height)),
    width: Math.min(r.width, wm.workArea.width),
    height: Math.min(r.height, wm.workArea.height),
  })

  const onDragStop: RndDragCallback = (e, d) => {
    const desktop = wm.desktopRef.current?.getBoundingClientRect()
    const p = pointerFrom(e)
    const zone = desktop && p ? detectSnapZone(p.x, p.y, desktop) : null
    wm.setSnapPreview(null)
    if (zone) wm.snapTo(win.id, zone)
    else {
      const next = contain({ ...win.rect, x: d.x, y: d.y })
      wm.setRect(win.id, { x: next.x, y: next.y })
    }
  }

  const onResizeStop: RndResizeCallback = (_e, _dir, el, _delta, pos) => {
    wm.setRect(
      win.id,
      contain({ x: pos.x, y: pos.y, width: el.offsetWidth, height: el.offsetHeight }),
    )
  }

  /*
   * Tear-off. react-rnd decides whether a press starts a drag at mousedown time, when this
   * window is still maximized and dragging is off, so restoring it in a React state update
   * cannot hand the same gesture to react-rnd. The gesture is tracked here instead: restore
   * on press, move with the pointer, and snap on release exactly as a react-rnd drag would.
   */
  const lastTearOff = useRef(0)
  const onTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isFloating || e.button !== 0) return
    // The minimize / restore / close buttons live in the title bar; leave them alone.
    if ((e.target as HTMLElement).closest('button')) return
    const desktopEl = wm.desktopRef.current
    const desktop = desktopEl?.getBoundingClientRect()
    if (!desktop) return
    e.preventDefault()
    wm.focus(win.id)

    const restored = restoredUnderPointer(rect, win.rect, e.clientX - desktop.left, wm.workArea)
    wm.setRect(win.id, restored)
    lastTearOff.current = performance.now()

    const start = { x: e.clientX, y: e.clientY }
    let moved = false
    const onMove = (ev: PointerEvent) => {
      const d = desktopEl?.getBoundingClientRect()
      if (!d) return
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      moved = true
      wm.setRect(win.id, {
        x: clamp(restored.x + dx, 0, wm.workArea.width - restored.width),
        y: clamp(restored.y + dy, 0, wm.workArea.height - restored.height),
      })
      wm.setSnapPreview(detectSnapZone(ev.clientX, ev.clientY, d))
    }
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      wm.setSnapPreview(null)
      // A maximized title bar sits on the top snap edge, so a plain click must not re-snap.
      if (!moved) return
      const d = desktopEl?.getBoundingClientRect()
      const zone = d ? detectSnapZone(ev.clientX, ev.clientY, d) : null
      if (zone) wm.snapTo(win.id, zone)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  const onTitleDoubleClick = () => {
    // The first press of a double-click on a maximized window already restored it; toggling
    // again here would maximize it straight back.
    if (performance.now() - lastTearOff.current < 500) return
    wm.toggleMaximize(win.id)
  }

  const dataAttrs = Object.fromEntries(
    Object.entries(win.data ?? {}).map(([k, v]) => [`data-${k}`, v]),
  )

  return (
    <Rnd
      size={{ width: rect.width, height: rect.height }}
      position={{ x: rect.x, y: rect.y }}
      minWidth={win.minWidth ?? MIN_WINDOW_WIDTH}
      minHeight={win.minHeight ?? MIN_WINDOW_HEIGHT}
      // Not "parent": the parent is the whole desktop and a window would slide under the
      // taskbar. The work-area element stops exactly where the taskbar starts.
      bounds={'.' + WORK_AREA_CLASS}
      dragHandleClassName={TITLEBAR_HANDLE}
      disableDragging={!isFloating}
      enableResizing={win.resizable !== false && !isMaximized}
      onDragStart={() => wm.focus(win.id)}
      onDrag={onDrag}
      onDragStop={onDragStop}
      onResizeStart={() => wm.focus(win.id)}
      onResizeStop={onResizeStop}
      style={{ zIndex: win.z, display: win.minimized ? 'none' : undefined }}
      className="dg-window"
    >
      <Frame
        boxShadow="$out"
        bgColor="$material"
        className="flex h-full w-full flex-col p-[2px]"
        role="dialog"
        aria-label={win.title}
        data-dg="window"
        data-dg-window={win.id}
        data-dg-active={isActive || undefined}
        {...dataAttrs}
        onMouseDown={() => wm.focus(win.id)}
      >
        <TitleBar
          active={isActive}
          icon={win.icon}
          title={win.title}
          className={`${TITLEBAR_HANDLE} select-none`}
          onPointerDown={onTitlePointerDown}
          onDoubleClick={onTitleDoubleClick}
        >
          <TitleBar.OptionsBox>
            <TitleBar.Minimize onClick={() => wm.minimize(win.id)} />
            {isMaximized ? (
              <TitleBar.Restore onClick={() => wm.toggleMaximize(win.id)} />
            ) : (
              <TitleBar.Maximize onClick={() => wm.toggleMaximize(win.id)} />
            )}
            <TitleBar.Close onClick={() => wm.close(win.id)} />
          </TitleBar.OptionsBox>
        </TitleBar>
        <div className="mt-[2px] flex min-h-0 flex-1 flex-col">{win.content}</div>
      </Frame>
    </Rnd>
  )
}
