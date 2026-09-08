import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { TASKBAR_HEIGHT } from './constants'
import type { IconComponent } from './icons'
import { useWindowManager } from './window/WindowManager'

/** Pointer travel, in px, before a press becomes a drag. Keeps clicks and double-clicks clean. */
const DRAG_THRESHOLD = 4

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

export type IconOffset = { x: number; y: number }

/**
 * The look of a desktop shortcut, in one place so that anything which is a shortcut can be one.
 * Clippy is the reason it is exported: he is a sprite the Clippy library owns rather than an SVG
 * we render, but on the desktop he is a shortcut like Projects or Email and has to be the same
 * width, the same label, the same focus ring and the same hand cursor. Two copies of this string
 * drifted apart within a day.
 *
 * focus-visible, not focus: a click must not leave a dotted box behind on the icon.
 */
export const DESKTOP_ICON_CLASS =
  'relative flex w-[84px] cursor-default flex-col items-center gap-1 border-none bg-transparent p-1 text-[12px] text-white outline-none focus-visible:[&>span]:bg-[var(--r95-color-headerBackground)] focus-visible:[&>span]:outline-dotted focus-visible:[&>span]:outline-1 focus-visible:[&>span]:outline-white'

/** Geometry the class above produces, for anything that has to line a sprite up with it. */
export const DESKTOP_ICON = { width: 84, padding: 4, artSize: 40, gap: 4, labelHeight: 15 } as const

type Gesture = {
  pointerId: number
  startX: number
  startY: number
  /** The offset when the press began; the drag adds pointer travel to it. */
  base: IconOffset
  moved: boolean
}

/**
 * An icon plus label on the desktop. A button rather than a div so it is focusable and
 * announced. Double-click or Enter opens; hover and mousedown fire onPrewarm so a project
 * container can start waking before the double-click lands.
 *
 * Icons can be dragged anywhere on the desktop, as on the real thing with Auto Arrange off.
 * The icon keeps its slot in whatever layout the parent uses and carries a translate offset,
 * clamped so no part of it can leave the desktop or slide under the taskbar. The offset is
 * controlled, so the app can remember where things were left.
 */
export function DesktopIcon({
  icon: Icon,
  label,
  onOpen,
  onPrewarm,
  tutorialKey,
  offset,
  onOffsetChange,
}: {
  icon: IconComponent
  label: string
  onOpen?: () => void
  onPrewarm?: () => void
  /** Value for data-tutorial, so a tour can point at this icon. */
  tutorialKey?: string
  /** Where the icon has been dragged to, relative to its place in the parent's layout. */
  offset?: IconOffset
  onOffsetChange?: (offset: IconOffset) => void
}) {
  const { desktopRef } = useWindowManager()
  const ref = useRef<HTMLButtonElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const [uncontrolled, setUncontrolled] = useState<IconOffset>({ x: 0, y: 0 })
  const current = offset ?? uncontrolled
  const [dragging, setDragging] = useState(false)

  const move = (next: IconOffset) => {
    if (!offset) setUncontrolled(next)
    onOffsetChange?.(next)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    onPrewarm?.()
    gesture.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, base: current, moved: false }
    // Capture so the drag keeps receiving moves when the pointer outruns the icon.
    ref.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (!g.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      g.moved = true
      setDragging(true)
    }
    const el = ref.current
    const desktop = desktopRef.current
    if (!el || !desktop) return
    const r = el.getBoundingClientRect()
    const d = desktop.getBoundingClientRect()
    // Where the icon sits with no offset applied, so the clamp is against a fixed origin.
    const homeLeft = r.left - current.x
    const homeTop = r.top - current.y
    move({
      x: clamp(g.base.x + dx, d.left - homeLeft, d.right - r.width - homeLeft),
      y: clamp(g.base.y + dy, d.top - homeTop, d.bottom - TASKBAR_HEIGHT - r.height - homeTop),
    })
  }

  const endGesture = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (gesture.current?.pointerId !== e.pointerId) return
    gesture.current = null
    setDragging(false)
    if (ref.current?.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId)
  }

  return (
    <button
      ref={ref}
      type="button"
      data-dg="desktop-icon"
      data-tutorial={tutorialKey}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen?.()
      }}
      onMouseEnter={onPrewarm}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      className={DESKTOP_ICON_CLASS}
      style={{
        fontFamily: 'inherit',
        textShadow: '1px 1px 0 #000',
        transform: `translate(${current.x}px, ${current.y}px)`,
        // The browser must not turn a touch drag into a scroll or a zoom.
        touchAction: 'none',
        // A dragged icon rides over its neighbours rather than under them.
        zIndex: dragging ? 2 : undefined,
      }}
    >
      {/* The icons are 32px SVGs with a viewBox, so CSS can size them; 40px is a step up
          without leaving the pixel-art look behind. */}
      <span className="flex [&>svg]:h-10 [&>svg]:w-10">
        <Icon variant="32x32_4" />
      </span>
      <span className="px-[2px] text-center leading-tight">{label}</span>
    </button>
  )
}
