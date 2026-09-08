import { useCallback, useEffect, useRef, useState } from 'react'
import { useClippy } from '@react95/clippy'
import { DESKTOP_ICON, DESKTOP_ICON_CLASS, TASKBAR_HEIGHT, useWindowManager } from '@duckdgoose/win95-ui'
import { randomQuote, type Quote } from '../../content/quotes'
import { readDesktopState, saveClippyPosition } from '../../lib/desktopState'
import {
  CLIPPY_FRAME,
  adoptClippy,
  clippyElement,
  hideClippy,
  placeClippy,
  playClippy,
  setClippyInteractive,
  setClippyLayer,
  showClippy,
} from '../../lib/clippy'
import { ClippyBalloon, type BalloonSide } from '../tour/ClippyBalloon'

/*
 * Clippy on the desk is a desktop shortcut, and the only thing that makes him different from
 * Projects or Email is that his artwork is a sprite the Clippy library owns rather than an SVG
 * we render. So the button here is a real desktop icon — same class, same width, same label,
 * same focus ring, same hand cursor — with an empty artwork slot, and the sprite is parked over
 * that slot. Everything visible is shared; only the placement maths is not.
 */

/** Fill the icon's artwork slot exactly, so he is the same size as every other shortcut. */
const SCALE = DESKTOP_ICON.artSize / CLIPPY_FRAME.height
const SPRITE_W = CLIPPY_FRAME.width * SCALE
const SPRITE_H = DESKTOP_ICON.artSize
/** The whole shortcut: padding, artwork, gap, label, padding. This is what has to fit on screen. */
const FULL_HEIGHT =
  DESKTOP_ICON.padding * 2 + DESKTOP_ICON.artSize + DESKTOP_ICON.gap + DESKTOP_ICON.labelHeight
/** Where the sprite sits inside the button. */
const SPRITE_OFFSET_X = (DESKTOP_ICON.width - SPRITE_W) / 2
const SPRITE_OFFSET_Y = DESKTOP_ICON.padding

const MARGIN = 16
/** Gap between Clippy and his balloon. */
const TIP = 14
/** Pointer travel before a press on Clippy counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4
/** With the icons, below every window: on the desk he is a shortcut like any other. */
const BALLOON_Z = 3
/** How long a quote stays up. */
const QUOTE_MS = 10_000
/** Gap between performances: a random spread so he never feels like a metronome. */
const FIRST_AFTER_MS = 6_000
const EVERY_MS = 26_000
const EVERY_JITTER_MS = 22_000

/** The ones with something to look at. Idles fill the gaps on their own. */
const PERFORMANCES = [
  'Wave',
  'GetAttention',
  'Congratulate',
  'Thinking',
  'Explain',
  'Searching',
  'Writing',
  'Print',
  'GetArtsy',
  'GetTechy',
  'GetWizardy',
  'EmptyTrash',
  'Alert',
  'Processing',
  'CheckingSomething',
  'Save',
  'SendMail',
  'LookUp',
  'LookLeft',
] as const

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

/**
 * Clippy as a desktop shortcut. He sits where he was left, idles, and every so often performs
 * something and offers a memento mori. Click him to start the tour; drag him anywhere on the
 * desktop, and he stays there next time.
 *
 * He stacks with the icons rather than above them, so windows pass over him exactly as they
 * pass over Projects or Email. His balloon is at the same level for the same reason, and it is
 * placed above him only when there is room — otherwise it goes underneath, which is what stops
 * him being dragged into the top of the screen and ending up standing on his own speech.
 *
 * Mounted only while no tour is running: a tour takes him over and hands him back.
 */
export function ClippyDesk({ onRunTutorial }: { onRunTutorial: () => void }) {
  const { clippy } = useClippy()
  const wm = useWindowManager()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [balloonSize, setBalloonSize] = useState({ width: 300, height: 92 })
  const onRunRef = useRef(onRunTutorial)
  onRunRef.current = onRunTutorial

  const area = wm.workArea
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => readDesktopState().clippy ?? null)
  const posRef = useRef(pos)
  posRef.current = pos

  // Default corner, once the desktop has a size. Clamped on every resize so a smaller window
  // can never strand him off the glass.
  useEffect(() => {
    if (area.width === 0 || area.height === 0) return
    setPos((prev) => {
      const base = prev ?? {
        x: area.width - DESKTOP_ICON.width - MARGIN,
        y: area.height - FULL_HEIGHT - MARGIN,
      }
      return {
        x: clamp(base.x, 0, Math.max(0, area.width - DESKTOP_ICON.width)),
        y: clamp(base.y, 0, Math.max(0, area.height - FULL_HEIGHT)),
      }
    })
  }, [area.width, area.height])

  const startDrag = useCallback(
    (event: PointerEvent) => {
      const desktop = wm.desktopRef.current
      const start = posRef.current
      if (!desktop || !start || event.button !== 0) return
      event.preventDefault()
      const from = { x: event.clientX, y: event.clientY }
      let moved = false
      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - from.x
        const dy = e.clientY - from.y
        if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        moved = true
        const d = desktop.getBoundingClientRect()
        setPos({
          x: clamp(start.x + dx, 0, Math.max(0, d.width - DESKTOP_ICON.width)),
          y: clamp(start.y + dy, 0, Math.max(0, d.height - TASKBAR_HEIGHT - FULL_HEIGHT)),
        })
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        // A press that never travelled is a click, and a click starts the tour.
        if (!moved) onRunRef.current()
        else if (posRef.current) saveClippyPosition(posRef.current)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [wm.desktopRef],
  )

  useEffect(() => {
    if (!clippy) return
    const desktop = wm.desktopRef.current
    if (desktop) adoptClippy(clippy, desktop)
    showClippy(clippy)
    setClippyInteractive(clippy, true)
    setClippyLayer(clippy, 'desk')
    const el = clippyElement(clippy)
    el.addEventListener('pointerdown', startDrag)
    return () => {
      el.removeEventListener('pointerdown', startDrag)
      setClippyInteractive(clippy, false)
      hideClippy(clippy)
    }
  }, [clippy, wm.desktopRef, startDrag])

  useEffect(() => {
    if (!clippy || !pos) return
    placeClippy(
      clippy,
      { x: pos.x + SPRITE_OFFSET_X, y: pos.y + SPRITE_OFFSET_Y, scale: SCALE },
      false,
    )
  }, [clippy, pos])

  useEffect(() => {
    if (!clippy) return
    let next = 0
    let hide = 0
    const perform = () => {
      playClippy(clippy, pick(PERFORMANCES))
      setQuote(randomQuote())
      window.clearTimeout(hide)
      hide = window.setTimeout(() => setQuote(null), QUOTE_MS)
      next = window.setTimeout(perform, EVERY_MS + Math.random() * EVERY_JITTER_MS)
    }
    next = window.setTimeout(perform, FIRST_AFTER_MS)
    return () => {
      window.clearTimeout(next)
      window.clearTimeout(hide)
    }
  }, [clippy])

  const onBalloonSize = useCallback((s: { width: number; height: number }) => {
    setBalloonSize((prev) => (prev.width === s.width && prev.height === s.height ? prev : s))
  }, [])

  if (!clippy || !pos || area.width === 0) return null

  const balloonWidth = Math.min(300, Math.max(180, area.width - 24))
  const centreX = pos.x + DESKTOP_ICON.width / 2
  const balloonLeft = clamp(centreX - balloonWidth / 2, 12, Math.max(12, area.width - balloonWidth - 12))
  // Above him when it fits, below him when it does not. Either way it never lands on him.
  const above = pos.y - TIP - balloonSize.height >= 8
  const balloonTop = above
    ? pos.y - TIP - balloonSize.height
    : Math.min(pos.y + FULL_HEIGHT + TIP, Math.max(8, area.height - balloonSize.height - 8))
  const side: BalloonSide = above ? 'bottom' : 'top'

  return (
    <>
      {/* A real desktop icon with an empty artwork slot; the sprite is placed over the slot by
          the effect above. Double-click matches the other shortcuts; a single click is handled
          on the sprite itself, where the drag also lives. */}
      <button
        type="button"
        data-dg="desktop-icon"
        data-tutorial="icon-clippy"
        className={`absolute ${DESKTOP_ICON_CLASS}`}
        style={{
          left: pos.x,
          top: pos.y,
          fontFamily: 'inherit',
          textShadow: '1px 1px 0 #000',
          touchAction: 'none',
        }}
        onDoubleClick={onRunTutorial}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onRunTutorial()
        }}
      >
        <span className="flex" style={{ width: SPRITE_W, height: SPRITE_H }} />
        <span className="px-[2px] text-center leading-tight">Clippy</span>
      </button>
      {quote && (
        <ClippyBalloon
          left={balloonLeft}
          top={balloonTop}
          width={balloonWidth}
          side={side}
          tip={clamp(centreX - balloonLeft, 24, balloonWidth - 24)}
          animate={false}
          zIndex={BALLOON_Z}
          onSize={onBalloonSize}
        >
          <p className="m-0">{quote.text}</p>
          <p className="m-0 mt-1 text-[11px] opacity-60">{quote.by}</p>
        </ClippyBalloon>
      )}
    </>
  )
}
