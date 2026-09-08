import { Icons, List } from '@duckdgoose/win95-ui'
import { useOpenWindow } from '../../lib/windows'

/**
 * The Start menu contents. The taskbar owns the popup; this is only the list inside it.
 * Videos, Projects, About, Contact are the four "pages" of the site.
 */
export function StartMenu({ onRunTutorial }: { onRunTutorial: () => void }) {
  const open = useOpenWindow()
  return (
    <div className="flex">
      <div
        className="flex w-[22px] items-end justify-center pb-2 font-bold text-white"
        style={{ background: 'var(--r95-color-headerNotActiveBackground, #808080)' }}
      >
        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: 1 }}>
          duckdgoose
        </span>
      </div>
      <List className="min-w-[180px]">
        <List.Item icon={<Icons.Videos variant="16x16_4" />} onClick={open.openVideos}>
          Videos
        </List.Item>
        <List.Item icon={<Icons.Folder variant="16x16_4" />} onClick={open.openProjects}>
          Projects
        </List.Item>
        <List.Item icon={<Icons.Games variant="16x16_4" />} onClick={open.openGames}>
          Games
        </List.Item>
        <List.Item icon={<Icons.Browser variant="16x16_4" />} onClick={() => open.openAbout('about')}>
          About
        </List.Item>
        <List.Item icon={<Icons.Email variant="16x16_4" />} onClick={() => open.openAbout('contact')}>
          Contact
        </List.Item>
        <List.Divider />
        <List.Item icon={<Icons.Notepad variant="16x16_4" />} onClick={onRunTutorial}>
          Run tutorial
        </List.Item>
      </List>
    </div>
  )
}
