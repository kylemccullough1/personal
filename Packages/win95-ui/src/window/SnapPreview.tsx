import { layoutForZone, rectForLayout } from './snap'
import { useWindowManager } from './WindowManager'

const EMPTY = { x: 0, y: 0, width: 0, height: 0 }

/** The translucent outline Windows shows while a drag hovers a snap edge. */
export function SnapPreview() {
  const { snapPreview, workArea } = useWindowManager()
  if (!snapPreview) return null
  const r = rectForLayout(layoutForZone(snapPreview), workArea, EMPTY)
  return (
    <div
      aria-hidden
      data-dg="snap-preview"
      className="pointer-events-none absolute border-2 border-white/80 bg-white/20"
      style={{ left: r.x, top: r.y, width: r.width, height: r.height, zIndex: 2_000_000 }}
    />
  )
}
