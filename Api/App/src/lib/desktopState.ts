import type { Rect, WindowLayout } from '@duckdgoose/win95-ui'

/*
 * The desk as you left it.
 *
 * A real desktop remembers where you dragged things, so this one does too: icon positions,
 * where Clippy is standing, and the geometry of every window that was open, keyed by window id.
 *
 * localStorage rather than sessionStorage, because "where things were when I was last here"
 * outlives a tab. It is per-browser and per-visitor, never sent anywhere, and every read is
 * wrapped: a private window, cleared site data or a schema change from a future version all
 * end the same way, with a fresh desktop rather than an exception.
 */

const KEY = 'dg.desktop.v1'

export type SavedWindow = { rect: Rect; layout: WindowLayout; minimized: boolean }

export type DesktopState = {
  /** Drag offset per desktop icon, keyed by its label. */
  icons: Record<string, { x: number; y: number }>
  /** Clippy's position on the desk, in desktop coordinates. */
  clippy?: { x: number; y: number }
  /** Geometry of windows that were open, keyed by window id. */
  windows: Record<string, SavedWindow>
  /** Window ids to reopen, in the order they were opened. */
  open: string[]
}

const EMPTY: DesktopState = { icons: {}, windows: {}, open: [] }

/** Anything that is not the shape we wrote is treated as nothing. */
function parse(raw: string | null): DesktopState {
  if (!raw) return EMPTY
  try {
    const value = JSON.parse(raw) as Partial<DesktopState>
    return {
      icons: typeof value.icons === 'object' && value.icons ? value.icons : {},
      clippy: value.clippy,
      windows: typeof value.windows === 'object' && value.windows ? value.windows : {},
      open: Array.isArray(value.open) ? value.open : [],
    }
  } catch {
    return EMPTY
  }
}

let cache: DesktopState | null = null

export function readDesktopState(): DesktopState {
  if (cache) return cache
  try {
    cache = parse(localStorage.getItem(KEY))
  } catch {
    cache = EMPTY
  }
  return cache
}

let writeTimer = 0

/**
 * Merge a change in and save. Debounced, because this is called from drag handlers: a window
 * dragged across the screen would otherwise serialize the whole desktop on every frame.
 */
export function saveDesktopState(patch: Partial<DesktopState>) {
  const next = { ...readDesktopState(), ...patch }
  cache = next
  window.clearTimeout(writeTimer)
  writeTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* quota or private mode; the desktop simply will not be remembered */
    }
  }, 250)
}

export function saveIconOffset(label: string, offset: { x: number; y: number }) {
  saveDesktopState({ icons: { ...readDesktopState().icons, [label]: offset } })
}

export function saveClippyPosition(at: { x: number; y: number }) {
  saveDesktopState({ clippy: at })
}

/** Forget everything. Wired to the Start menu so a visitor can put the desk back. */
export function clearDesktopState() {
  cache = { icons: {}, windows: {}, open: [] }
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}
