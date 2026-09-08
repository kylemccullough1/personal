import type { IconName } from '@duckdgoose/win95-ui'

export type Project = {
  id: string
  name: string
  icon: IconName
  /** Shown in the folder's Type column. Keep it to one short line. */
  kind: string
  blurb: string
  body: string[]
  tech: string[]
  status: 'planned' | 'in progress' | 'live'
  /**
   * The deployed app, if there is one. The portfolio holds nothing but this URL: no shared
   * code, no build coupling, and the window always points at whatever that app last deployed.
   */
  liveUrl?: string
  /**
   * Show liveUrl inside the window (an iframe) rather than as a way out to a new tab. Only set
   * this once the target has been verified to allow framing: it must not send X-Frame-Options
   * and its CSP frame-ancestors must permit this origin, or the browser shows a blank box or
   * "refused to connect" and there is no way to detect that from JavaScript.
   *
   * Charter Trip was false for exactly that reason: Blazor Server sends both headers by default
   * (traced in notes/personal/docs-log.md, 2026-09-06, "Blazor Server ships its own
   * anti-clickjacking headers"). That is fixed and deployed — the app now drops X-Frame-Options
   * and names this origin in frame-ancestors — so it is true. Verified against the running site:
   *
   *   curl -sD - -o /dev/null https://<the app>/ | grep -i "x-frame\|content-security"
   *   Content-Security-Policy: frame-ancestors 'self' https://duckdgoose.net
   *     https://www.duckdgoose.net http://localhost:5173
   *
   * If that header ever loses this origin the window goes blank with nothing thrown, so check it
   * there rather than here.
   */
  embed?: boolean
  /** Source repository, shown on the GitHub tab. */
  repoUrl?: string
  /** Show the guided showcase (Tour and GitHub tabs). Only Charter Trip has one today. */
  showcase?: boolean
}

/**
 * Projects shown on the desktop. One is live and linked by URL; the other two are being
 * built next and read as intent rather than as descriptions of software.
 */
export const projects: Project[] = [
  {
    id: 'charter-trip',
    name: 'Charter Trip',
    // Globe: it is a website, and the window frames the real one. Swap if a better icon is
    // added to the catalog -- check both 32x32_4 and 16x16_4 render before you do.
    icon: 'Browser',
    kind: 'Web app',
    blurb: 'Trip companion for an annual twenty-six person weekend.',
    body: [
      // TODO(Kyle): your own words. This is drawn from the code, not from you.
      'A companion app for an annual weekend away: itinerary, travel and arrival times, house and area information, teams and a shared leaderboard, plus the three party games that run across the weekend.',
      'Built as a Blazor Server app over a single JSON document rather than a database, so the whole trip is one file that can be read, edited and version-controlled. The Live tab is the running site, framed.',
    ],
    tech: ['C#', '.NET 10', 'Blazor Server', 'JSON document store'],
    status: 'live',
    liveUrl: 'https://chartertrip-ggeddmesa6d7hbbd.centralus-01.azurewebsites.net',
    embed: true,
    repoUrl: 'https://github.com/kylemccullough1/CharterTrip4',
    showcase: true,
  },
  {
    id: 'asset-studio',
    name: 'Windows 95 Asset Studio',
    icon: 'AssetStudio',
    kind: 'Tool',
    blurb: 'Turn this site into After Effects assets.',
    body: [
      'A sandbox that is literally this desktop with an inspector bolted on. Ctrl-click any window, button or icon and the studio serializes it: the bevel geometry read straight off its computed styles, the icon as the SVG pixel paths it already is.',
      'From there it exports what the Movie Munch Off edit needs: 9-slice PNGs, shape layers, and eventually a whole comp. The point is never to rebuild the Windows 95 look by hand in After Effects again.',
    ],
    tech: ['React', 'The shared win95-ui package', 'ExtendScript', 'After Effects'],
    status: 'planned',
  },
  {
    id: 'clip-maker',
    name: 'Clip Maker',
    icon: 'ClipMaker',
    kind: 'Tool',
    blurb: 'Disc to timestamped clip, with the boring parts automated.',
    body: [
      'The pipeline behind the show. Rip a disc, find the moment, cut a clip to a ProRes intermediate that drops straight onto the timeline, with the metadata that makes it findable later.',
      'Desktop-side .NET rather than web, because the work is local, heavy, and talks to hardware. It shares the After Effects automation with the asset studio once that exists.',
    ],
    tech: ['.NET', 'FFMpegCore', 'ProRes intermediates'],
    status: 'planned',
  },
]

export const projectById = (id: string) => projects.find((p) => p.id === id)
