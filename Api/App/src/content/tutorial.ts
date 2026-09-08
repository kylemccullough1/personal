import type { TourStep } from './tour'

/**
 * The site tutorial, as data. Each step says what Clippy says, what it points at, which
 * clippyjs animation to play, any shell actions to perform first, and, for the hands-on steps,
 * what the visitor does to move on. The strings in `actions` and `advanceWhen` are resolved by
 * components/tour/SiteTour, which is also what closes the windows the tour opened.
 *
 * Every step plays a different animation so he stays alive across the whole tour; the idle
 * loop fills the gaps and a minute of no input puts him in RestPose (see ClippyTour).
 */
export const tutorialSteps: TourStep[] = [
  {
    id: 'welcome',
    say: 'Welcome to duckdgoose.net! Would you like a quick tour?',
    animation: 'Greeting',
    clippy: 'center',
    actions: ['closeStartMenu'],
    nextLabel: 'Yes, show me around',
    skipLabel: 'No thanks',
  },
  {
    id: 'start-button',
    say: 'Everything starts here. This is the Start button.',
    hint: 'Click it to continue.',
    targets: [{ key: 'start-button' }],
    animation: 'GestureDown',
    clippy: 'near',
    actions: ['closeStartMenu'],
    advanceWhen: 'startMenuOpen',
  },
  {
    id: 'start-menu',
    say: 'Open it and you get access to every page on the site.',
    hint: 'Close the menu to continue.',
    targets: [{ key: 'start-menu' }],
    animation: 'GestureLeft',
    clippy: 'near',
    actions: ['openStartMenu'],
    advanceWhen: 'startMenuOpen',
  },
  {
    id: 'icon-projects',
    say: 'The desktop has shortcuts too.',
    hint: 'Double-click Projects to open it. You can drag the shortcuts around as well.',
    targets: [{ key: 'icon-projects' }],
    animation: 'Explain',
    clippy: 'near',
    actions: ['closeStartMenu', 'closeProjects'],
    advanceWhen: 'projectsOpen',
  },
  {
    id: 'window-move',
    say: 'This is a window. Drag its title bar to move it anywhere on the desktop.',
    targets: [{ key: 'projects-window' }],
    animation: 'Searching',
    clippy: 'near',
    actions: ['openProjects'],
    advanceWhen: 'projectsMoved',
  },
  {
    id: 'window-buttons',
    say: 'The three buttons up top minimize, maximize and close it. Grab any edge or corner to resize it.',
    hint: 'Try one to continue.',
    targets: [{ key: 'projects-window' }],
    animation: 'GestureUp',
    clippy: 'near',
    actions: ['openProjects'],
    advanceWhen: 'projectsReshaped',
  },
  {
    id: 'window-snap',
    say: 'Two windows now. Drag one to the left edge of the screen and the other to the right edge, and they snap to each half. Drag one to the top edge to fill the screen.',
    hint: 'Snap both to continue.',
    targets: [{ key: 'projects-window' }, { key: 'project-asset-studio' }],
    animation: 'GetAttention',
    clippy: 'near',
    actions: ['openProjects', 'openSecondProject', 'floatAll'],
    advanceWhen: 'windowsArranged',
    // Longer than the default: two windows have just landed side by side and that is the thing
    // the step exists to show. Ending on the visitor's mouse-up wastes it.
    advanceAfter: 1400,
  },
  {
    id: 'done',
    say: "Good luck, and don't forget to have fun! :)",
    animation: 'Congratulate',
    clippy: 'center',
    actions: ['closeTourWindows'],
    nextLabel: 'Finish',
  },
]
