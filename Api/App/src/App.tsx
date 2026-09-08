import { useCallback, useEffect, useState } from 'react'
import { ClippyProvider } from '@react95/clippy'
import { Desktop, TaskBar, WindowLayer, WindowManagerProvider } from '@duckdgoose/win95-ui'
import { ClippyHost } from './components/boot/ClippyHost'
import { CrtFrame } from './components/boot/CrtFrame'
import { ClippyDesk } from './components/desktop/ClippyDesk'
import { DesktopIcons } from './components/desktop/DesktopIcons'
import { DesktopMemory } from './components/desktop/DesktopMemory'
import { SpeakerButton } from './components/desktop/SpeakerButton'
import { StartMenu } from './components/desktop/StartMenu'
import { SiteTour } from './components/tour/SiteTour'
import { armAudioOnFirstGesture } from './lib/audio'

const VISITED_KEY = 'dg.visited'
const TUTORIAL_SEEN_KEY = 'dg.tutorial.seen'

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* storage unavailable; the site simply treats every visit as the first */
  }
}

/**
 * The machine switching on, then the desktop, then (first visit only) the Clippy tour.
 *
 * The switch-on is a first-visit event, like the tour: it is a nice thirty seconds once and an
 * obstacle on the fifth visit, so a returning desk is simply lit when it arrives. Both flags
 * are read once, before the first render, because reading them later would mean deciding
 * whether to animate after the frame that would have animated.
 */
export function App() {
  const [firstVisit] = useState(() => !readFlag(VISITED_KEY))
  const [powered, setPowered] = useState(() => readFlag(VISITED_KEY))
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => armAudioOnFirstGesture(), [])

  const onPoweredOn = useCallback(() => {
    writeFlag(VISITED_KEY)
    setPowered(true)
    if (!readFlag(TUTORIAL_SEEN_KEY)) setTourOpen(true)
  }, [])

  const startTour = useCallback(() => setTourOpen(true), [])
  const finishTour = useCallback(() => {
    writeFlag(TUTORIAL_SEEN_KEY)
    setTourOpen(false)
  }, [])

  return (
    <WindowManagerProvider>
      <ClippyProvider agentName="Clippy">
        <CrtFrame powerOn={firstVisit} onPoweredOn={onPoweredOn}>
          <Desktop>
            <DesktopIcons />
            <WindowLayer />
            <TaskBar startMenu={<StartMenu onRunTutorial={startTour} />} tray={<SpeakerButton />} />
            {/* ClippyHost before anything that shows Clippy: see the note in ClippyHost. */}
            <ClippyHost />
            {/* The desk is only restored once the tour is out of the way, so a first-time
                visitor is not walked through a screen full of windows they never opened. */}
            <DesktopMemory enabled={powered && !tourOpen} />
            {powered && !tourOpen && <ClippyDesk onRunTutorial={startTour} />}
            {powered && tourOpen && <SiteTour onFinish={finishTour} />}
          </Desktop>
        </CrtFrame>
      </ClippyProvider>
    </WindowManagerProvider>
  )
}
