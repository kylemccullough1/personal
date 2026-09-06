import { useState } from 'react'
import { Desktop, DesktopIcon, Icons, Modal, TitleBar, TaskBar, List } from '@duckdgoose/win95-ui'

export function App() {
  const [aboutOpen, setAboutOpen] = useState(true)

  return (
    <Desktop>
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DesktopIcon icon={Icons.MyComputer} label="My Computer" />
        <DesktopIcon icon={Icons.Folder} label="Projects" />
        <DesktopIcon icon={Icons.Notepad} label="About" onOpen={() => setAboutOpen(true)} />
      </div>

      {aboutOpen && (
        <Modal
          width="380px"
          height="240px"
          icon={<Icons.Notepad variant="16x16_4" />}
          title="About - duckdgoose"
          titleBarOptions={[
            <TitleBar.Minimize key="min" />,
            <TitleBar.Maximize key="max" />,
            <TitleBar.Close key="close" onClick={() => setAboutOpen(false)} />,
          ]}
          dragOptions={{ defaultPosition: { x: 160, y: 80 } }}
        >
          <Modal.Content boxShadow="$in" bgColor="white" style={{ padding: 8 }}>
            <p>Personal projects. Windows 95 UI. Nothing here yet.</p>
          </Modal.Content>
        </Modal>
      )}

      <TaskBar
        list={
          <List>
            <List.Item icon={<Icons.Folder variant="16x16_4" />}>Programs</List.Item>
            <List.Item icon={<Icons.Notepad variant="16x16_4" />} onClick={() => setAboutOpen(true)}>
              About
            </List.Item>
          </List>
        }
      />
    </Desktop>
  )
}
