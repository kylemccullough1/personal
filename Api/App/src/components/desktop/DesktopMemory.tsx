import { useEffect, useRef, useState } from 'react'
import { useWindowManager } from '@duckdgoose/win95-ui'
import { readDesktopState, saveDesktopState } from '../../lib/desktopState'
import { useOpenWindow } from '../../lib/windows'

/**
 * Remembers which windows were open and where, and puts them back on the next visit.
 *
 * It lives in the app rather than in the window manager on purpose: the package should not
 * know that this site keeps anything in a browser, and a different app using the same manager
 * may want a different policy, or none. All the manager exposes is its window list, which is
 * enough to both save and restore from out here.
 *
 * The two effects below each wait for something, and both waits were bugs first:
 *
 *  - Restoring waits for the desktop to have a size. A provider's effects run after its
 *    children's, so on the first commit the work area is still zero, and windows restored into
 *    it get fitted to a screen that does not exist yet — every one of them in the top corner.
 *  - Saving waits for `ready`. Restoring dispatches a handful of opens that do not reach the
 *    window list until the next render, so a save in the same commit sees an empty desktop and
 *    writes "nothing was open" over the thing it just restored. A timeout cannot run until
 *    React has applied those opens, which is exactly the wait that was needed.
 */
export function DesktopMemory({ enabled }: { enabled: boolean }) {
  const wm = useWindowManager()
  const open = useOpenWindow()
  const openRef = useRef(open)
  openRef.current = open
  const restored = useRef(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled || restored.current || wm.workArea.width === 0) return
    restored.current = true
    const saved = readDesktopState()
    // In the order they were opened, so the stacking comes back roughly as it was.
    saved.open.forEach((id) => openRef.current.openById(id))
    const t = window.setTimeout(() => setReady(true), 0)
    return () => window.clearTimeout(t)
  }, [enabled, wm.workArea.width])

  useEffect(() => {
    if (!enabled || !ready) return
    // Merged over what is already stored rather than replacing it, so a window that has been
    // closed keeps how it was left. Writing only the open windows meant closing a maximized
    // window deleted the one fact worth keeping about it, and reopening it from the desktop
    // started from the defaults again. `open` is still the live list, so a closed window is
    // not reopened on the next visit — it is only remembered in case it is.
    const windows = {
      ...readDesktopState().windows,
      ...Object.fromEntries(
        wm.windows.map((w) => [w.id, { rect: w.rect, layout: w.layout, minimized: w.minimized }]),
      ),
    }
    saveDesktopState({ windows, open: wm.windows.map((w) => w.id) })
  }, [enabled, ready, wm.windows])

  return null
}
