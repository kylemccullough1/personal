// Side-effect imports: the library global styles, the Windows 95 theme, then our overrides.
import '@react95/core/GlobalStyle'
import '@react95/core/themes/win95.css'
import './theme.css'

// React95 primitives re-exported so apps import from one place. Modal, TaskBar and the
// useModal bus are deliberately absent: the window manager below replaces them.
export {
  Frame,
  Button,
  List,
  Tree,
  Input,
  TextArea,
  Fieldset,
  Checkbox,
  ProgressBar,
  Alert,
  Tooltip,
  TitleBar,
} from '@react95/core'

// The window manager.
export { WindowManagerProvider, useWindowManager } from './window/WindowManager'
export { WindowLayer } from './window/WindowLayer'
export { WindowFrame } from './window/WindowFrame'
export type { WindowSpec, WindowState, WindowLayout, SnapZone, Rect } from './window/types'

// Composites, tokens and catalog.
export { Desktop, WORK_AREA_CLASS } from './Desktop'
export { DesktopIcon, DESKTOP_ICON, DESKTOP_ICON_CLASS } from './DesktopIcon'
export { TaskBar } from './TaskBar'
export { Icons, type IconName } from './icons'
export * from './constants'
