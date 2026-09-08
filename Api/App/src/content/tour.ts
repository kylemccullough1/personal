/**
 * The shape of any Clippy tour: the site tutorial, the Charter Trip showcase, and whatever
 * comes next. A tour is a list of steps; the engine (components/tour/ClippyTour) plays them
 * and the app supplies what the strings mean: which shell action an `actions` entry runs, and
 * what an `advanceWhen` key watches.
 */
export type TourTarget = {
  /** A data-tutorial value somewhere in the DOM. */
  key: string
  /** Highlight colour. Defaults walk HIGHLIGHT_COLORS, so a second target reads differently. */
  color?: string
}

export type TourStep = {
  id: string
  say: string
  /** Smaller second line: what to do to continue. */
  hint?: string
  /** Things to spotlight and point at. The first is where Clippy stands. */
  targets?: TourTarget[]
  animation?: string
  /** Shell actions to run on entering the step, in order. Resolved by the app. */
  actions?: string[]
  /** 'center': front and centre, very large. 'near': beside the first target, large. */
  clippy: 'center' | 'near'
  /**
   * Advance on its own when the watched value changes after the step settles. Resolved by the app.
   *
   * The app decides what "changed" means, and for a step that asks for more than one thing it
   * should report progress rather than every intermediate move — otherwise the first half of the
   * job ends the step. See `windowsArranged` in SiteTour.
   */
  advanceWhen?: string
  /**
   * How long to let the visitor look at what they just did before moving on, in milliseconds.
   *
   * Omitted means none: a step that ends the moment you click Start is right, and a wait there
   * only reads as lag. Set it on the steps whose result takes a moment to be worth seeing — a
   * window sliding into half the screen — and leave the rest instant.
   */
  advanceAfter?: number
  nextLabel?: string
  skipLabel?: string
}

/** Yellow first, cyan second: the two read as different on the teal desktop and on grey chrome. */
export const HIGHLIGHT_COLORS = ['#ffff00', '#00ffff'] as const
