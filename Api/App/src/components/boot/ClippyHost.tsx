import { useLayoutEffect } from 'react'
import { useClippy } from '@react95/clippy'
import { useWindowManager } from '@duckdgoose/win95-ui'
import { adoptClippy, hideClippy } from '../../lib/clippy'

/**
 * Owns Clippy while no tutorial is running: the moment the agent finishes loading it is moved
 * into the desktop and hidden. ClippyProvider shows him on load (bottom-right of the browser
 * window, idling forever), which is not wanted; he belongs to the tour and nothing else.
 *
 * A layout effect rather than a plain effect so the hide happens before the browser paints
 * the frame in which he would otherwise flash into view. Mount this before ClippyTutorial so
 * that, when both react to the agent arriving in the same commit, the tutorial's show wins.
 */
export function ClippyHost() {
  const { clippy } = useClippy()
  const { desktopRef } = useWindowManager()

  useLayoutEffect(() => {
    if (!clippy) return
    const desktop = desktopRef.current
    if (desktop) adoptClippy(clippy, desktop)
    hideClippy(clippy)
  }, [clippy, desktopRef])

  return null
}
