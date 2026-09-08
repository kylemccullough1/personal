import { useCallback, useEffect, useRef } from 'react'
import { useWindowManager } from '@duckdgoose/win95-ui'
import { tutorialSteps } from '../../content/tutorial'
import { WINDOW_IDS, useOpenWindow } from '../../lib/windows'
import { ClippyTour } from './ClippyTour'

const SECOND_PROJECT = 'asset-studio'

/**
 * The site tutorial: content/tutorial.ts played by ClippyTour, with the strings in it resolved
 * here, plus the bookkeeping the engine should not know about.
 *
 * Clearing up at the end is that bookkeeping. Anything open before the tour started is the
 * visitor's and is left exactly as it was; anything that appeared during the tour is the
 * tour's mess and gets closed, whether the tour opened it or the visitor did because a step
 * asked them to. Tracking only what the tour opened itself was worse in practice: the step
 * that says "double-click Projects" leaves a window behind on the desktop that the visitor
 * never chose to keep.
 */
export function SiteTour({ onFinish }: { onFinish: () => void }) {
  const wm = useWindowManager()
  const open = useOpenWindow()
  const wmRef = useRef(wm)
  wmRef.current = wm
  const openRef = useRef(open)
  openRef.current = open

  /** What was already on screen when the tour began. Captured once, before any step runs. */
  const preexisting = useRef<Set<string> | null>(null)
  if (preexisting.current === null) preexisting.current = new Set(wm.windows.map((w) => w.id))

  const closeTourWindows = useCallback(() => {
    const shell = wmRef.current
    const before = preexisting.current ?? new Set<string>()
    shell.windows.forEach((w) => {
      if (!before.has(w.id)) shell.close(w.id)
    })
  }, [])

  const runAction = useCallback((action: string) => {
    const shell = wmRef.current
    const windows = openRef.current
    switch (action) {
      case 'openStartMenu':
        shell.setStartMenuOpen(true)
        break
      case 'closeStartMenu':
        shell.setStartMenuOpen(false)
        break
      case 'openProjects':
        windows.openProjects()
        break
      case 'closeProjects':
        // The shortcuts step asks the visitor to open Projects, so it must start closed.
        shell.close(WINDOW_IDS.projects)
        break
      case 'openSecondProject':
        windows.openProject(SECOND_PROJECT)
        break
      case 'floatAll':
        shell.windows.forEach((w) => {
          if (w.layout !== 'floating') shell.setRect(w.id, {})
        })
        break
      case 'closeTourWindows':
        closeTourWindows()
        break
    }
  }, [closeTourWindows])

  /** A string that changes when the watched thing changes; the engine compares, it does not interpret. */
  const fingerprint = useCallback(
    (watch: string): string => {
      const projects = wm.windows.find((w) => w.id === WINDOW_IDS.projects)
      switch (watch) {
        case 'startMenuOpen':
          return String(wm.startMenuOpen)
        case 'projectsOpen':
          return String(!!projects)
        case 'projectsMoved':
          return projects ? `${projects.rect.x},${projects.rect.y},${projects.layout}` : 'gone'
        case 'projectsReshaped':
          return projects
            ? `${projects.rect.width},${projects.rect.height},${projects.layout},${projects.minimized}`
            : 'gone'
        // Reports whether the arrangement is finished, not how far along it is.
        //
        // This used to be the count of snapped windows, which changed the moment the first
        // window touched an edge — so the step ended mid-gesture, before the window had even
        // finished sliding into place and long before the second one was tried. The step asks
        // for two things, so the value it is watched by has to mean "both", and the only way to
        // say that through a fingerprint the engine does not interpret is to report the answer
        // rather than the progress.
        //
        // Filling the screen counts too: the step offers the top edge as an alternative, and a
        // visitor who takes it has done what was asked and should not be left waiting.
        case 'windowsArranged': {
          const left = wm.windows.some((w) => w.layout === 'left')
          const right = wm.windows.some((w) => w.layout === 'right')
          const filled = wm.windows.some((w) => w.layout === 'maximized')
          return String((left && right) || filled)
        }
        default:
          return ''
      }
    },
    [wm],
  )

  const finish = useCallback(() => {
    closeTourWindows()
    onFinish()
  }, [closeTourWindows, onFinish])

  // Skipping with Escape is the same as pressing Skip, including the clear-up.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  return <ClippyTour steps={tutorialSteps} runAction={runAction} fingerprint={fingerprint} onFinish={finish} />
}
