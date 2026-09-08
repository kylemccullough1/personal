import type { IconName } from '@duckdgoose/win95-ui'

export type Game = {
  id: string
  name: string
  icon: IconName
  kind: string
  blurb: string
  body: string[]
  tech: string[]
}

/**
 * The three party games. They exist today as Blazor pages inside the CharterTrip app; the
 * plan is to bring their C# game logic across as an API and rebuild each one as a window
 * here. Until then these windows describe rather than play. Nothing links out.
 */
export const games: Game[] = [
  {
    id: 'jeopardy',
    name: 'Jeopardy',
    icon: 'GameShow',
    kind: 'Party game',
    blurb: 'Game-show board with phone buzzers and live scoring.',
    body: [
      'A full Jeopardy board built for a twenty-six person trip. The host drives the board from a laptop on the TV while players buzz in from their own phones, so there is no hardware to pack.',
      'Scores do not stay in the game. They feed a trip-wide leaderboard that every event on the weekend shares.',
    ],
    tech: ['C#', '.NET 10', 'SignalR buzzers', 'JSON store'],
  },
  {
    id: 'spelling-bee',
    name: 'Spelling Bee',
    icon: 'Letters',
    kind: 'Party game',
    blurb: 'Elimination bee with a generated word deck.',
    body: [
      'The words are generated, not hand-picked. A word bank is filtered and graded so each round steps up in difficulty without repeating a stem or handing two players the same shape of word.',
      'The deck logic is the interesting part, and it is the most heavily documented piece of the whole trip app.',
    ],
    tech: ['C#', '.NET 10', 'Custom word-deck generator'],
  },
  {
    id: 'murder-mystery',
    name: 'Murder Mystery',
    icon: 'Investigate',
    kind: 'Party game',
    blurb: 'Twenty-one characters, three killers, six factions.',
    body: [
      'The largest of the three. A casting service assigns twenty-one characters across six factions, then deals each guest their own role, secrets and objectives privately to their phone.',
      'The evening runs as three trials with clue drops between them, then a ballot and a reveal. A print kit produces the materials that work better on paper than on a screen.',
    ],
    tech: ['C#', '.NET 10', 'Per-guest tokens', 'Print stylesheet'],
  },
]

export const gameById = (id: string) => games.find((g) => g.id === id)
