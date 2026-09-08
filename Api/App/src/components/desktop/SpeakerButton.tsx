import { useSyncExternalStore } from 'react'
import { audioStore, setMuted } from '../../lib/audio'

/**
 * The taskbar's speaker. Windows 95 put one in the tray, and this one is also the honest
 * answer to a browser's autoplay rules: sound cannot start before a visitor interacts with the
 * page, so there has to be something to press.
 */
export function SpeakerButton() {
  const muted = useSyncExternalStore(audioStore.subscribe, audioStore.isMuted, () => true)

  return (
    <button
      type="button"
      data-dg="speaker"
      title={muted ? 'Sound off' : 'Sound on'}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={!muted}
      className="flex h-[22px] w-[22px] cursor-default items-center justify-center border-none bg-transparent p-0"
      onClick={() => setMuted(!muted)}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
        <path d="M2 6h3l3-3v10l-3-3H2z" fill="#000" />
        {muted ? (
          <path d="M10 6l4 4M14 6l-4 4" stroke="#000" strokeWidth="1.5" fill="none" />
        ) : (
          <>
            <path d="M10 5c1.6 1.4 1.6 4.6 0 6" stroke="#000" strokeWidth="1.2" fill="none" />
            <path d="M12 3c2.8 2.4 2.8 7.6 0 10" stroke="#000" strokeWidth="1.2" fill="none" />
          </>
        )}
      </svg>
    </button>
  )
}
