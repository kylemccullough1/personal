// Side-effect imports: the library global styles, the Windows 95 theme, then our overrides.
import '@react95/core/GlobalStyle'
import '@react95/core/themes/win95.css'
import './theme.css'

// Re-export the primitives so apps import everything from one place.
export {
  Modal,
  TitleBar,
  TaskBar,
  Frame,
  Button,
  List,
  Tree,
  Tabs,
  Tab,
  ProgressBar,
  Alert,
  Tooltip,
  useModal,
  ModalEvents,
} from '@react95/core'

// Our composites and catalog.
export { Desktop } from './Desktop'
export { DesktopIcon } from './DesktopIcon'
export { Icons, type IconName } from './icons'
