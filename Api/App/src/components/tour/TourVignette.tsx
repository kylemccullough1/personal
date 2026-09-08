export type Hole = { left: number; top: number; width: number; height: number }

/** Fraction of each spotlight that stays fully clear before it starts to feather out. */
export const HOLE_CLEAR = 0.46

/**
 * Dims the screen except where the step is pointing.
 *
 * The edge is a gradient rather than a cut. A hard-edged hole reads as a box drawn around
 * something, which is a different and worse thing than a light falling on it, and it fights the
 * curved glass everything else sits behind. What made the first version of this hard to read was
 * not the gradient, it was that the gradient *moved*: the whole screen shifted every time the
 * step changed. So the feathering is back and the animation is not.
 *
 * The mask is luminance: white shows the dimming rectangle, black hides it. Each spotlight is an
 * ellipse filled with a black-to-white radial gradient, so it is fully clear in the middle and
 * fully dimmed at its edge. Overlapping spotlights simply stay clear where they overlap.
 *
 * pointer-events: none throughout — the tour asks the visitor to click the things it
 * highlights, so the overlay must never be in the way.
 */
export function TourVignette({ holes }: { holes: Hole[] }) {
  return (
    <svg
      aria-hidden
      data-dg="tour-vignette"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 2_500_000 }}
    >
      <defs>
        <radialGradient id="dg-tour-hole">
          <stop offset="0%" stopColor="#000" />
          <stop offset={`${HOLE_CLEAR * 100}%`} stopColor="#000" />
          <stop offset="100%" stopColor="#fff" />
        </radialGradient>
        <mask id="dg-tour-mask">
          <rect width="100%" height="100%" fill="#fff" />
          {holes.map((h, i) => (
            <ellipse
              key={i}
              cx={h.left + h.width / 2}
              cy={h.top + h.height / 2}
              rx={h.width / 2 / HOLE_CLEAR}
              ry={h.height / 2 / HOLE_CLEAR}
              fill="url(#dg-tour-hole)"
              // Multiply, not paint over. Two spotlights drawn normally stack in source order,
              // so the second one's faded outer ring lands on top of the first one's clear
              // middle and draws a visible edge across it — which is what made Clippy's halo
              // show up as a ring whenever he stood near the thing he was pointing at.
              // Multiplying keeps whichever value is darker, so overlapping spotlights melt
              // into one larger clear area instead of cutting each other.
              style={{ mixBlendMode: 'multiply' }}
            />
          ))}
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#dg-tour-mask)" />
    </svg>
  )
}
