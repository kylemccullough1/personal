import { useCallback, useState } from 'react'
import { DesktopIcon, Icons, type IconName } from '@duckdgoose/win95-ui'
import { readDesktopState, saveIconOffset } from '../../lib/desktopState'
import { useOpenWindow } from '../../lib/windows'

type Shortcut = { label: string; icon: IconName; tutorialKey: string; open: () => void }

/**
 * The shortcut column down the left of the desktop. Order is the order visitors read them.
 * Where each icon has been dragged to is remembered per visitor, keyed by its label, so the
 * desk looks the way it was left.
 */
export function DesktopIcons() {
  const open = useOpenWindow()
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>(
    () => readDesktopState().icons,
  )

  const moveIcon = useCallback((label: string, offset: { x: number; y: number }) => {
    setOffsets((prev) => ({ ...prev, [label]: offset }))
    saveIconOffset(label, offset)
  }, [])

  const shortcuts: Shortcut[] = [
    { label: 'About', icon: 'Browser', tutorialKey: 'icon-about', open: () => open.openAbout('about') },
    { label: 'Projects', icon: 'Folder', tutorialKey: 'icon-projects', open: open.openProjects },
    { label: 'Games', icon: 'Games', tutorialKey: 'icon-games', open: open.openGames },
    { label: 'Videos', icon: 'Videos', tutorialKey: 'icon-videos', open: open.openVideos },
    { label: 'Email', icon: 'Email', tutorialKey: 'icon-email', open: () => open.openAbout('contact') },
    { label: 'Phone', icon: 'Phone', tutorialKey: 'icon-phone', open: open.openPhone },
  ]

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2" data-tutorial="desktop-icons">
      {shortcuts.map((s) => (
        <DesktopIcon
          key={s.label}
          icon={Icons[s.icon]}
          label={s.label}
          tutorialKey={s.tutorialKey}
          onOpen={s.open}
          offset={offsets[s.label] ?? { x: 0, y: 0 }}
          onOffsetChange={(offset) => moveIcon(s.label, offset)}
        />
      ))}
    </div>
  )
}
