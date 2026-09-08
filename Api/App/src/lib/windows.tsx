import { useCallback } from 'react'
import { Icons, useWindowManager, type WindowSpec } from '@duckdgoose/win95-ui'
import { gameById, games } from '../content/games'
import { projectById, projects } from '../content/projects'
import { BrowserWindow, type BrowserTab } from '../components/browser/BrowserWindow'
import { FolderView } from '../components/desktop/FolderView'
import { GameWindow } from '../components/games/GameWindow'
import { PhoneWindow } from '../components/browser/PhoneWindow'
import { ProjectWindow } from '../components/projects/ProjectWindow'
import { VideosWindow } from '../components/videos/VideosWindow'
import { readDesktopState } from './desktopState'

/*
 * The window registry: every window the site can open, by id, and what goes in it.
 * Components never build WindowSpecs themselves; they call openWindow('projects') and this
 * file decides the title, icon, size and content. One place to look, one place to change.
 */

export const WINDOW_IDS = {
  about: 'about',
  projects: 'projects',
  games: 'games',
  videos: 'videos',
  phone: 'phone',
  project: (id: string) => `project:${id}`,
  game: (id: string) => `game:${id}`,
} as const

/**
 * How this window was last left: its floating rectangle and whether it was maximized or snapped.
 *
 * This is remembered per window id whether or not the window was open when the page was closed,
 * so maximizing a window and then closing it means the next open is maximized too. That is what
 * a desktop does — closing a window is not a request to forget how you had it — and it is the
 * whole reason this is keyed by id rather than derived from what happened to be on screen.
 */
function remembered(id: string) {
  return readDesktopState().windows[id]
}

/** Merge the remembered geometry and layout over a window's defaults. */
function withMemory(spec: WindowSpec): WindowSpec {
  const saved = remembered(spec.id)
  if (!saved) return spec
  return {
    ...spec,
    initialRect: { ...spec.initialRect, ...saved.rect },
    initialLayout: saved.layout,
  }
}

export function useOpenWindow() {
  const wm = useWindowManager()

  const openAbout = useCallback(
    (tab: BrowserTab = 'about') => {
      wm.open(
        withMemory({
          id: WINDOW_IDS.about,
          title: tab === 'contact' ? 'Contact - duckdgoose Explorer' : 'About - duckdgoose Explorer',
          icon: <Icons.Browser variant="16x16_4" />,
          content: <BrowserWindow tab={tab} />,
          initialRect: { width: 560, height: 420 },
          data: { tutorial: 'about-window' },
        }),
      )
    },
    [wm],
  )

  const openProject = useCallback(
    (id: string) => {
      const project = projectById(id)
      if (!project) return
      const Icon = Icons[project.icon]
      wm.open(
        withMemory({
          id: WINDOW_IDS.project(id),
          title: project.name,
          icon: <Icon variant="16x16_4" />,
          content: <ProjectWindow project={project} />,
          // So a tour can point at this window: data-tutorial="project-<id>".
          data: { tutorial: `project-${id}` },
          // An embedded site or a showcase needs room to be worth looking at; a writeup does not.
          initialRect:
            (project.liveUrl && project.embed) || project.showcase
              ? { width: 940, height: 640 }
              : { width: 480, height: 380 },
        }),
      )
    },
    [wm],
  )

  const openGame = useCallback(
    (id: string) => {
      const game = gameById(id)
      if (!game) return
      const Icon = Icons[game.icon]
      wm.open(
        withMemory({
          id: WINDOW_IDS.game(id),
          title: game.name,
          icon: <Icon variant="16x16_4" />,
          content: <GameWindow game={game} />,
          initialRect: { width: 460, height: 360 },
        }),
      )
    },
    [wm],
  )

  const openProjects = useCallback(() => {
    wm.open(
      withMemory({
        id: WINDOW_IDS.projects,
        title: 'Projects',
        icon: <Icons.FolderOpen variant="16x16_4" />,
        content: (
          <FolderView
            items={projects.map((p) => ({ id: p.id, name: p.name, icon: p.icon, kind: p.kind, detail: p.blurb }))}
            onOpen={openProject}
          />
        ),
        initialRect: { width: 540, height: 240 },
        data: { tutorial: 'projects-window' },
      }),
    )
  }, [wm, openProject])

  const openGames = useCallback(() => {
    wm.open(
      withMemory({
        id: WINDOW_IDS.games,
        title: 'Games',
        icon: <Icons.Games variant="16x16_4" />,
        content: (
          <FolderView
            items={games.map((g) => ({ id: g.id, name: g.name, icon: g.icon, kind: g.kind, detail: g.blurb }))}
            onOpen={openGame}
          />
        ),
        initialRect: { width: 540, height: 260 },
      }),
    )
  }, [wm, openGame])

  const openVideos = useCallback(() => {
    wm.open(
      withMemory({
        id: WINDOW_IDS.videos,
        title: 'Videos',
        icon: <Icons.Videos variant="16x16_4" />,
        content: <VideosWindow />,
        initialRect: { width: 520, height: 380 },
      }),
    )
  }, [wm])

  const openPhone = useCallback(() => {
    wm.open(
      withMemory({
        id: WINDOW_IDS.phone,
        title: 'Phone',
        icon: <Icons.Phone variant="16x16_4" />,
        content: <PhoneWindow />,
        initialRect: { width: 300, height: 180 },
        resizable: false,
      }),
    )
  }, [wm])

  /**
   * Open a window by the id it was saved under. This is what restores the desk on a return
   * visit; ids that no longer exist (a project that was renamed) are ignored rather than
   * throwing, so an old saved desktop can never break a load.
   */
  const openById = useCallback(
    (id: string) => {
      if (id === WINDOW_IDS.about) return openAbout('about')
      if (id === WINDOW_IDS.projects) return openProjects()
      if (id === WINDOW_IDS.games) return openGames()
      if (id === WINDOW_IDS.videos) return openVideos()
      if (id === WINDOW_IDS.phone) return openPhone()
      if (id.startsWith('project:')) return openProject(id.slice('project:'.length))
      if (id.startsWith('game:')) return openGame(id.slice('game:'.length))
    },
    [openAbout, openProjects, openGames, openVideos, openPhone, openProject, openGame],
  )

  const closeAll = useCallback(() => {
    wm.windows.forEach((w) => wm.close(w.id))
  }, [wm])

  return {
    openAbout,
    openProjects,
    openGames,
    openProject,
    openGame,
    openVideos,
    openPhone,
    openById,
    closeAll,
  }
}

export type OpenWindow = ReturnType<typeof useOpenWindow>
