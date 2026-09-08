import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH, TASKBAR_HEIGHT } from '../constants'
import type { Rect, Size, SnapZone, WindowLayout, WindowSpec, WindowState } from './types'
import { layoutForZone } from './snap'

/*
 * The window manager. One reducer owns every window's geometry, layout, minimized flag and
 * stacking order; the components under it are pure renders of that state. Keeping it in a
 * reducer rather than scattered useState calls matters for two later consumers: the tutorial
 * needs to drive windows programmatically, and the Phase 3 studio needs to serialize them.
 */

type State = {
  windows: WindowState[]
  activeId: string | null
  /** Monotonic. Handed out on focus so the most recently focused window is always on top. */
  topZ: number
  /** Where a drag in progress would snap, for the translucent preview. */
  snapPreview: SnapZone | null
}

type Action =
  | { type: 'open'; spec: WindowSpec; cascadeIndex: number; workArea: Size }
  | { type: 'close'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'blur' }
  | { type: 'minimize'; id: string }
  | { type: 'restore'; id: string }
  | { type: 'toggleMaximize'; id: string }
  | { type: 'setLayout'; id: string; layout: WindowLayout }
  | { type: 'setRect'; id: string; rect: Partial<Rect> }
  | { type: 'setSnapPreview'; zone: SnapZone | null }

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi))

const DEFAULT_SIZE = { width: 480, height: 320 }
const CASCADE_STEP = 24

function patch(state: State, id: string, changes: Partial<WindowState>): State {
  return {
    ...state,
    windows: state.windows.map((w) => (w.id === id ? { ...w, ...changes } : w)),
  }
}

function raise(state: State, id: string): State {
  const topZ = state.topZ + 1
  return { ...patch(state, id, { z: topZ }), topZ, activeId: id }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open': {
      const existing = state.windows.find((w) => w.id === action.spec.id)
      if (existing) {
        // Reopening replaces title and content (so "open About at the Contact tab" works),
        // brings it back from the taskbar, and raises it. Geometry is left alone.
        const next = patch(state, existing.id, {
          title: action.spec.title,
          icon: action.spec.icon ?? existing.icon,
          content: action.spec.content,
          minimized: false,
        })
        return raise(next, existing.id)
      }
      const offset = action.cascadeIndex * CASCADE_STEP
      // Fit the window to the work area before placing it. A 940px window cascaded to x=88 on
      // a 1000px desktop opened with its right-hand third off the glass, which looks broken
      // even though it can be dragged back. Size is capped first, then the position is pulled
      // in so the whole window is on screen.
      // A window can be opened before the desktop has been measured, and an unmeasured desktop
      // would otherwise clamp every window to the top-left corner. Zero means "not known yet",
      // and the honest response is to place the window as asked and leave it alone.
      const known = action.workArea.width > 0 && action.workArea.height > 0
      const width = known
        ? Math.min(action.spec.initialRect?.width ?? DEFAULT_SIZE.width, Math.max(action.workArea.width - 16, MIN_WINDOW_WIDTH))
        : (action.spec.initialRect?.width ?? DEFAULT_SIZE.width)
      const height = known
        ? Math.min(action.spec.initialRect?.height ?? DEFAULT_SIZE.height, Math.max(action.workArea.height - 16, MIN_WINDOW_HEIGHT))
        : (action.spec.initialRect?.height ?? DEFAULT_SIZE.height)
      const x = action.spec.initialRect?.x ?? 64 + offset
      const y = action.spec.initialRect?.y ?? 48 + offset
      const rect: Rect = {
        x: known ? clamp(x, 0, Math.max(0, action.workArea.width - width)) : x,
        y: known ? clamp(y, 0, Math.max(0, action.workArea.height - height)) : y,
        width,
        height,
      }
      const topZ = state.topZ + 1
      const win: WindowState = {
        resizable: true,
        ...action.spec,
        rect,
        // The rect above is the floating one either way. A window asked to open maximized keeps
        // it as the size the restore button goes back to, exactly as a window maximized by hand
        // keeps the size it had before.
        layout: action.spec.initialLayout ?? 'floating',
        minimized: false,
        z: topZ,
      }
      return { ...state, windows: [...state.windows, win], topZ, activeId: win.id }
    }
    case 'close': {
      const windows = state.windows.filter((w) => w.id !== action.id)
      // Focus passes to whichever remaining window is on top, as Windows does.
      const next = windows.reduce<WindowState | null>(
        (top, w) => (!w.minimized && (!top || w.z > top.z) ? w : top),
        null,
      )
      return { ...state, windows, activeId: next?.id ?? null }
    }
    case 'focus':
      if (state.activeId === action.id) return state
      return raise(state, action.id)
    case 'blur':
      return { ...state, activeId: null }
    case 'minimize':
      return {
        ...patch(state, action.id, { minimized: true }),
        activeId: state.activeId === action.id ? null : state.activeId,
      }
    case 'restore':
      return raise(patch(state, action.id, { minimized: false }), action.id)
    case 'toggleMaximize': {
      const w = state.windows.find((x) => x.id === action.id)
      if (!w) return state
      return patch(state, action.id, {
        layout: w.layout === 'maximized' ? 'floating' : 'maximized',
      })
    }
    case 'setLayout':
      return patch(state, action.id, { layout: action.layout })
    case 'setRect': {
      const w = state.windows.find((x) => x.id === action.id)
      if (!w) return state
      // Any explicit geometry change means the user is floating the window again.
      return patch(state, action.id, { rect: { ...w.rect, ...action.rect }, layout: 'floating' })
    }
    case 'setSnapPreview':
      return state.snapPreview === action.zone ? state : { ...state, snapPreview: action.zone }
  }
}

type WindowManagerValue = {
  windows: WindowState[]
  activeId: string | null
  snapPreview: SnapZone | null
  /** The desktop element. Windows are positioned inside it and snap to its edges. */
  desktopRef: RefObject<HTMLDivElement | null>
  /** Desktop size minus the taskbar: what maximize and snap fill. */
  workArea: Size
  /** Start menu visibility lives here so the tutorial can open it, not only the button. */
  startMenuOpen: boolean
  setStartMenuOpen: (open: boolean) => void
  open: (spec: WindowSpec) => void
  close: (id: string) => void
  focus: (id: string) => void
  blur: () => void
  minimize: (id: string) => void
  restore: (id: string) => void
  toggleMaximize: (id: string) => void
  snapTo: (id: string, zone: SnapZone) => void
  setRect: (id: string, rect: Partial<Rect>) => void
  setSnapPreview: (zone: SnapZone | null) => void
  isOpen: (id: string) => boolean
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null)

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    windows: [],
    activeId: null,
    topZ: 10,
    snapPreview: null,
  })
  const desktopRef = useRef<HTMLDivElement | null>(null)
  const [desktopSize, setDesktopSize] = useState<Size>({ width: 0, height: 0 })
  const [startMenuOpen, setStartMenuOpen] = useState(false)

  // The desktop is not the viewport: the CRT bezel around the site shrinks it. Measure the
  // element itself so snapping and maximize fill the screen the user can actually see.
  useEffect(() => {
    const el = desktopRef.current
    if (!el) return
    // Measure once, synchronously. ResizeObserver only reports during a rendering step, which
    // a hidden tab never runs, so a site opened in a background tab would otherwise maximize
    // and snap windows to a zero-sized work area until the tab was first shown.
    //
    // clientWidth/clientHeight rather than getBoundingClientRect: the rect is scaled by any
    // transform on an ancestor, and the switch-on animation squashes the whole picture to a
    // line. Measuring through that gave a work area two pixels tall, which is a desktop
    // nothing can be placed on. The layout box does not move when something is scaled, which
    // is also what ResizeObserver reports below, so the two agree.
    setDesktopSize({ width: el.clientWidth, height: el.clientHeight })
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setDesktopSize({ width: Math.floor(width), height: Math.floor(height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const workArea = useMemo<Size>(
    () => ({ width: desktopSize.width, height: Math.max(0, desktopSize.height - TASKBAR_HEIGHT) }),
    [desktopSize],
  )

  const cascadeIndex = useRef(0)
  // The reducer needs the work area to fit a new window to the screen, and a reducer cannot
  // read a ref, so it is passed in with the action.
  const workAreaRef = useRef(workArea)
  workAreaRef.current = workArea
  const open = useCallback((spec: WindowSpec) => {
    dispatch({ type: 'open', spec, cascadeIndex: cascadeIndex.current % 8, workArea: workAreaRef.current })
    cascadeIndex.current += 1
  }, [])

  const value = useMemo<WindowManagerValue>(
    () => ({
      windows: state.windows,
      activeId: state.activeId,
      snapPreview: state.snapPreview,
      desktopRef,
      workArea,
      startMenuOpen,
      setStartMenuOpen,
      open,
      close: (id) => dispatch({ type: 'close', id }),
      focus: (id) => dispatch({ type: 'focus', id }),
      blur: () => dispatch({ type: 'blur' }),
      minimize: (id) => dispatch({ type: 'minimize', id }),
      restore: (id) => dispatch({ type: 'restore', id }),
      toggleMaximize: (id) => dispatch({ type: 'toggleMaximize', id }),
      snapTo: (id, zone) => dispatch({ type: 'setLayout', id, layout: layoutForZone(zone) }),
      setRect: (id, rect) => dispatch({ type: 'setRect', id, rect }),
      setSnapPreview: (zone) => dispatch({ type: 'setSnapPreview', zone }),
      isOpen: (id) => state.windows.some((w) => w.id === id),
    }),
    [state, workArea, startMenuOpen, open],
  )

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindowManager must be used inside <WindowManagerProvider>')
  return ctx
}
