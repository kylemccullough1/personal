/**
 * The Charter Trip showcase: sections of slides shown in the project window's Tour tab.
 * Each slide has what is on screen (a screenshot, a diagram, or places in the code) and the
 * copy that goes with it.
 *
 * ORDERING, and it matters: the committee credentials below are published to anyone who opens
 * this window. They are only safe once the read-only build of Charter Trip is deployed, which
 * is the branch feature/PortfolioEdits in that repository. Deploy that first.
 *
 * The admin screenshots were captured from a signed-in session on the live site, so they show
 * the real trip rather than the seed.
 */
export const charterTrip = {
  repo: 'https://github.com/kylemccullough1/CharterTrip4',
  site: 'https://chartertrip-ggeddmesa6d7hbbd.centralus-01.azurewebsites.net',
  /** The committee sign-in, published on purpose. See the note above. */
  credentials: { username: 'jake123', password: 'jake123' },
  /** A file in the repo, on the main branch. */
  file: (path: string) => `https://github.com/kylemccullough1/CharterTrip4/blob/main/${path}`,
} as const

export type DiagramKind = 'projects' | 'writePath' | 'auth' | 'liveUpdates' | 'deploy'

export type CodeLocation = { label: string; path: string; note: string }

export type Slide = {
  id: string
  title: string
  body?: string[]
  /** A screenshot under /showcase/charter-trip/. */
  image?: string
  /** Placeholder card text when there is no image yet. */
  pending?: string
  diagram?: DiagramKind
  code?: CodeLocation[]
  /** Rendered as a sign-in card. */
  credentials?: boolean
}

/**
 * Tabs carry a colour because there are a lot of them now — four sections and, under Games, one
 * per event. A row of identical grey buttons is a list you have to read; a row of coloured ones
 * is a place you can point at, and the colour is the same on the second visit as it was on the
 * first. The selected tab shows its colour at full strength and pressed; the rest are the same
 * hue mixed most of the way back to the Windows grey, so the strip still reads as one control.
 */
export type Group = { id: string; label: string; color?: string; slides: Slide[] }
export type Section = { id: string; label: string; color?: string; groups: Group[] }

export const sections: Section[] = [
  {
    id: 'ui',
    label: 'UI tour',
    color: '#5aa6ff',
    groups: [
      {
        id: 'user',
        label: 'User',
        color: '#5aa6ff',
        slides: [
          {
            id: 'ui-home',
            title: 'The trip, as a guest sees it',
            image: 'home.jpg',
            body: [
              'Charter Trip is one weekend a year: twenty-six people, four teams, one trophy. Everyone gets this site instead of a group chat.',
              'A Blazor Server app with an Art Deco theme. The home page carries the standings, the weekend at a glance, and whatever the committee wants everyone to see first.',
            ],
          },
          {
            id: 'ui-essentials',
            title: 'Itinerary: the essentials',
            image: 'essentials.jpg',
            body: [
              'Where, when, what it costs and what to bring — the answers to every question that otherwise gets asked six times.',
              'Tabs across the top switch between Essentials, Schedule, Menu and Carpool without leaving the page.',
            ],
          },
          {
            id: 'ui-schedule',
            title: 'Itinerary: the schedule',
            image: 'schedule.jpg',
            body: [
              'Three days on a timeline. Empty hours collapse so the plan fits on a phone, and expand on request.',
              'For the committee this same view is editable in place: add, delete, drag between days, sort by time.',
            ],
          },
          {
            id: 'ui-menu',
            title: 'Itinerary: the menu',
            image: 'itinerary-menu.jpg',
            body: [
              'Every meal of the weekend, by day, with what is covered written down so nobody has to ask twice. Empty slots say "nothing planned" rather than disappearing, because a gap is information too.',
              'The chips along the bottom are what is stocked all weekend.',
            ],
          },
          {
            id: 'ui-carpool',
            title: 'Itinerary: getting there',
            image: 'itinerary-carpool.jpg',
            body: [
              'Who is in which car, where they are leaving from, and when they expect to arrive. Same colour, same car.',
              'Everyone can set their own arrival time rather than routing it through whoever is holding the plan, which is the whole reason this page exists.',
            ],
          },
          {
            id: 'ui-venue',
            title: 'Venue and area',
            image: 'venue.jpg',
            body: ['The house itself: rooms, the pool, check-in times, and the stores and parks within a few minutes.'],
          },
          {
            id: 'ui-guests',
            title: 'What guests cannot see',
            image: 'committee-only.jpg',
            body: [
              'Teams, games and data are committee-only. A guest who follows a link there gets a door, not an error.',
              'Pages ask a permissions object what the viewer may do, and the navigation prunes committee-only entries per person.',
            ],
          },
        ],
      },
      {
        id: 'admin',
        label: 'Admin',
        color: '#ffa62e',
        slides: [
          {
            id: 'admin-login',
            title: 'The committee sign-in',
            image: 'login.jpg',
            credentials: true,
            body: [
              'One account for the whole committee. Sign in with the details above and the site turns into the admin view.',
              'Both halves are stored as PBKDF2-SHA256 hashes and compared in fixed time, so nothing in the repository can be turned back into either one. This deployment is read-only, so anything you press is refused before it reaches the file.',
            ],
          },
          {
            id: 'admin-edit',
            title: 'Editing in place',
            image: 'admin-schedule.jpg',
            body: [
              'There is no admin panel. This is the same schedule the guests read, with the affordances turned on: drag a card to move it, drag its bottom edge to change how long it runs, click it to edit the details.',
              'Text becomes an input where you click it, commits on blur or Enter, and cancels on Escape. One version of every screen to build and maintain, not two.',
            ],
          },
          {
            id: 'admin-teams',
            title: 'Teams and scoring',
            image: 'admin-teams.jpg',
            body: [
              'Four teams, twenty-five people, and a live scoreboard. Drag a name onto another team to move them; click a team name to rename it or its dot to recolour it.',
              'When the committee awards a point from a phone, every other screen in the house updates at once, without a refresh.',
            ],
          },
          {
            id: 'admin-data',
            title: 'Data in, data out',
            image: 'admin-data.jpg',
            body: [
              'The whole trip is one JSON file. This page says where it is, what revision it is on and whether it is saving, hands you a copy of it, and takes one back.',
              'An import replaces everything, so it parses and migrates the file first, shows the counts side by side against what is live, and copies the outgoing trip to a backup that is never pruned.',
            ],
          },
        ],
      },
    ],
  },
  {
    // Eight events, and each one gets its own tab rather than a place in one long strip. They
    // are the part of this app with the most going on and the least in common with each other:
    // Jeopardy is a buzzer race, the mystery is a twenty-one-hander with private cards, the
    // noodle cup game is four rules and a scoreboard. Reading them in one queue flattens all of
    // that. A tab per game lets each one be as long as it needs to be.
    id: 'games',
    label: 'Games',
    color: '#ffd23f',
    groups: [
      {
        id: 'g-all',
        label: 'All eight',
        color: '#9fb4c8',
        slides: [
          {
            id: 'games-index',
            title: 'Eight events across the weekend',
            image: 'games-index.jpg',
            body: [
              'Every game is a card here: when it runs, who hosts it, and how many rules it has. Four of them are just rules and a scoreboard. Four of them are running software.',
              'None of this is markup. A game is trip data, so the committee adds one, renames it, rewrites its rules and changes what it is worth without anybody opening the project.',
            ],
          },
        ],
      },
      {
        id: 'g-jeopardy',
        label: 'Jeopardy',
        color: '#ffd23f',
        slides: [
          {
            id: 'game-jeopardy-page',
            title: 'Jeopardy',
            image: 'game-jeopardy-page.jpg',
            body: [
              'Friday night, everyone playing, five categories of in-group lore. The page is the same shape every game gets: when it runs, who hosts it, what it scores, and the rules.',
              'The button at the bottom is the only difference between a game that is a piece of paper and a game that is software.',
            ],
          },
          {
            id: 'game-jeopardy-lobby',
            title: 'Getting twenty-six phones into a game',
            image: 'game-jeopardy-lobby.jpg',
            body: [
              'Every game starts the same way: a QR code and a four-character word on the television. Point a camera at it, pick your name, and your phone is a buzzer — no app, no accounts, nothing typed but four letters if the camera will not focus.',
              'The host takes their own sheet through the same code, so the one person who needs the answers gets them on their own phone rather than off the screen everyone else is looking at.',
            ],
          },
          {
            id: 'game-jeopardy-board',
            title: 'The board',
            image: 'game-jeopardy-board.jpg',
            body: [
              'Five categories of in-group lore and a running score per team across the top. The fastest thumb opens the board, and from then on the team that answers correctly picks the next clue.',
            ],
          },
          {
            id: 'game-phones',
            title: 'Every phone is a buzzer',
            image: 'game-phones-buzz.jpg',
            body: [
              'A player’s phone shows their team’s colour, their score, and one enormous button. The server decides who was first, so ties are settled by the same clock rather than by whoever shouted loudest.',
            ],
          },
          {
            id: 'game-board-phones',
            title: 'The board and the room at once',
            image: 'game-board-phones.jpg',
            body: [
              'The television and the phones are the same game from two ends. A buzz lands on the board in the same instant it leaves the thumb, because both screens are on one connection to one server rather than polling for news.',
            ],
          },
          {
            id: 'game-jeopardy',
            title: 'Jeopardy, as it finished',
            image: 'game-jeopardy.jpg',
            body: [
              'This is the real board at the end of the weekend, scores and all. Em’s Little Monsters took it on 100.',
            ],
          },
        ],
      },
      {
        id: 'g-mystery',
        label: 'Mystery',
        color: '#ff6b6b',
        slides: [
          {
            id: 'game-mystery-lobby',
            title: 'Murder at the Braun Manor',
            image: 'game-mystery-lobby.jpg',
            body: [
              'The same join flow, and then twenty-one characters are dealt privately — each person’s secret, motive, who they are protecting and what they did that looks suspicious arrives on their own phone and nobody else’s.',
              'Three killers, six factions, three trials. The counter under the code is the host watching the room fill up.',
            ],
          },
          {
            id: 'game-mystery-card',
            title: 'The card you were dealt',
            image: 'game-mystery-card.jpg',
            body: [
              'Every character arrives on one phone and no other: age, who you are, why you were invited, and what you cannot stand about the man whose house this is. Twenty-one of these are in the room at once and no two people can read each other’s.',
              'This is the host’s own card. The rest carry a secret, an alibi, a faction and, for three of them, a murder.',
            ],
          },
          {
            id: 'game-mystery-investigation',
            title: 'Nine cards, nine rooms',
            image: 'game-mystery-investigation.jpg',
            body: [
              'Once the body is found the television becomes the room: a floor plan of the manor with the study marked, and every guest still standing along the bottom.',
              'Clues are QR cards taped up around the real house. Scanning one puts it in your phone’s evidence list and nobody else’s, so what you know is genuinely yours to trade.',
            ],
          },
          {
            id: 'game-mystery-trial',
            title: 'The trial',
            image: 'game-mystery-trial.jpg',
            body: [
              'Three trials across the evening. Everybody names one person from their own phone and nothing is shown until the last vote is in, so the room cannot watch itself decide.',
              'The counter at the bottom is the only thing that moves while the accusations are being cast.',
            ],
          },
          {
            id: 'game-mystery-control',
            title: 'The game master’s phone',
            image: 'game-mystery-control.jpg',
            body: [
              'Braun works the room, dies, and then hands his own phone the evening. The Control tab tells the host what is happening right now, how long the round is meant to run, and gives them the single button that ends it.',
              'Behind it sit three more tabs: send a private message to one guest, move somebody to a room, or jump the whole evening to any phase if something goes sideways in front of twenty-five people.',
            ],
          },
          {
            id: 'game-mystery',
            title: 'The whole truth',
            image: 'game-mystery.jpg',
            body: [
              'This is the ending the room actually reached: the house won, and the app wrote the verdict.',
            ],
          },
        ],
      },
      {
        id: 'g-spelling',
        label: 'Spelling bee',
        color: '#5ad1ff',
        slides: [
          {
            id: 'game-spelling-page',
            title: 'The row',
            image: 'game-spelling-page.jpg',
            body: [
              'One shuffled row, one word each, miss it and you are out. Everyone who has joined stands in the order the app shuffled them into, in their team’s colour.',
              'The row is public and the word is not. It goes to exactly one phone — whoever is holding the host code — so nobody standing in the row can read ahead.',
            ],
          },
          {
            id: 'game-spelling-setup',
            title: 'Setting a game up',
            image: 'game-spelling-setup.jpg',
            body: [
              'Behind the wall is the game’s own settings: which difficulty the words open at, with the size of each list shown so the choice is informed, what a word is worth, and the rules themselves as editable lines that can be reordered or deleted.',
              'The dial is where the bee opens rather than a fixed deck — words are drawn as turns come up, so the host moves it up or down from their phone while the bee is running.',
            ],
          },
          {
            id: 'game-spelling',
            title: 'Last one standing',
            image: 'game-spelling.jpg',
            body: [
              'The bee ends when one speller is left, and their team takes the points. Ana won this one.',
            ],
          },
        ],
      },
      {
        id: 'g-sketch',
        label: 'Police sketch',
        color: '#b98cff',
        slides: [
          {
            id: 'game-sketch',
            title: 'Police sketch',
            image: 'game-sketch.jpg',
            body: [
              'Hosts describe a character one feature at a time and each team member draws a single piece before rotating the paper. Twenty points to the first team to name who it is.',
              'The Edit button beside the scoring is the whole story of how these pages are built: the points, the round count and the rules are trip data, so the committee changes them in place rather than asking for a deploy.',
            ],
          },
          {
            id: 'game-sketch-live',
            title: 'Running it',
            image: 'game-sketch-live.jpg',
            body: [
              'Five rounds from a cast of fourteen, one character at a time, with the scoreboard alongside so a round can be awarded the moment somebody shouts the right name.',
            ],
          },
        ],
      },
      {
        id: 'g-noodlecup',
        label: 'Noodle cups',
        color: '#3fd9a8',
        slides: [
          {
            id: 'game-noodlecup',
            title: 'Pool noodle cups',
            image: 'game-noodlecup.jpg',
            body: [
              'Six rounds, one player per team at a time, ten points a cup. Short rules, clearly stated, which is what a game needs at eleven in the morning.',
            ],
          },
          {
            id: 'game-noodlecup-live',
            title: 'Counting cups',
            image: 'game-noodlecup-live.jpg',
            body: [
              'The scoring surface is shared across every game that scores this way, so the committee counts cups on the same control they use to award anything else, and the points land on the same scoreboard.',
            ],
          },
        ],
      },
      {
        id: 'g-beerrun',
        label: 'Beer run',
        color: '#ffa62e',
        slides: [
          {
            id: 'game-beerrun-page',
            title: 'Beer run',
            image: 'game-beerrun-page.jpg',
            body: ['Collect the beers, before lunch on the Saturday, optionally as a drinking game.'],
          },
          {
            id: 'game-beerrun',
            title: 'How a result screen looks',
            image: 'game-beerrun.jpg',
            body: [
              'Every game ends on the same screen: the winner across the top, the four teams underneath, and the points already on the board.',
              'Goose Goose Duck took this one on 90.',
            ],
          },
        ],
      },
      {
        id: 'g-relay',
        label: 'Relay race',
        color: '#a8e05a',
        slides: [
          {
            id: 'game-relay',
            title: 'Relay race',
            image: 'game-relay.jpg',
            body: [
              'A multi-leg outdoor relay where each team leader runs a leg for a team that is not their own. A hundred points to the first team home, and a hundred and twenty if they did it a person short.',
            ],
          },
          {
            id: 'game-relay-legs',
            title: 'Six legs',
            image: 'game-relay-legs.jpg',
            body: [
              'Jump rope, flip cup, a food race, mini beer pong, high low, and an egg carried on chopsticks. The legs are a list in the trip file, so the order changes without a deploy.',
            ],
          },
          {
            id: 'game-relay-live',
            title: 'Clocks on the line',
            image: 'game-relay-live.jpg',
            body: [
              'The relay is scored on finishing time rather than on points per round, so its live screen is a set of stopwatches — one per team, started together and stopped as each team comes in.',
            ],
          },
        ],
      },
      {
        id: 'g-superlatives',
        label: 'Superlatives',
        color: '#ff7fc4',
        slides: [
          {
            id: 'game-superlatives',
            title: 'Superlatives and the trophy',
            image: 'game-superlatives.jpg',
            body: [
              'The last thing that happens: a group vote on each superlative, best dressed judged off the murder mystery outfits, and the trophy to the team on top.',
              'This one is scored on paper, and the page says so rather than pretending to be a system. Not every game needed software, and deciding which ones did was most of the design.',
            ],
          },
        ],
      },
      {
        id: 'g-testing',
        label: 'Testing',
        color: '#b0b8c0',
        slides: [
          {
            id: 'game-testing',
            title: 'Twenty-five phones on one laptop',
            image: 'game-testing-rail.jpg',
            body: [
              'This is the testing rail, and it is the reason any of the games worked on the night. Each panel is a genuine browser session with its own identity and its own connection to the server, walking in the real front door — not a mock, and not the host’s screen pretending.',
              'The shortcuts beside it fast-forward the parts that need a room full of people: everybody joins, everybody votes, the vote splits four ways, somebody tampers with a clue. A game with twenty-one private character cards cannot be tested by one person clicking through it, and this is what made it possible to find the bugs before the weekend rather than during it.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    color: '#2fd18a',
    groups: [
      {
        id: 'backend',
        label: 'Backend',
        slides: [
          {
            id: 'be-projects',
            title: 'Three projects, one direction',
            diagram: 'projects',
            body: [
              'Web talks to Infrastructure talks to Core, and never the other way. Core references nothing at all, so its rules run in a test with no host, no filesystem and no browser.',
              'Core declares the storage interface and Infrastructure supplies the JSON implementation. Swapping in a database is a new class in one project; the other two never find out.',
            ],
          },
          {
            id: 'be-blazor',
            title: 'The browser is a remote display',
            diagram: 'liveUpdates',
            body: [
              'Every page is a C# object living in server memory. A click travels up a WebSocket, the handler runs on the server, and only the changed HTML comes back down.',
              'No REST layer, no DTOs, no client state to keep in step. The payoff is the scoreboard: because every visitor’s UI lives in one process, awarding a point pushes new HTML to twenty-six phones for free.',
            ],
          },
          {
            id: 'be-store',
            title: 'One write path',
            diagram: 'writePath',
            body: [
              'The trip is deserialized once at startup and held in memory, so rendering a page costs no disk. Every write goes through one method, and nothing else touches the file.',
              'That method takes a lock, applies the change, bumps a revision, schedules a debounced save and raises an event. The save writes a temp file, forces it to disk and renames it, so a crash mid-save cannot truncate the real one.',
            ],
          },
          {
            id: 'be-auth',
            title: 'Who is looking',
            diagram: 'auth',
            body: [
              'Three ways to be signed in — the committee account, a personal link from a QR code, or a buzzer code — all resolving to one permissions record that every page reads.',
              'It comes from the authentication cookie through Blazor’s own state provider rather than from the HTTP context, because on Blazor Server there is a context during the first render and never again.',
            ],
          },
          {
            id: 'be-code',
            title: 'Where to look in the code',
            code: [
              { label: 'ITripStore', path: 'src/CharterTrip.Core/Abstractions/ITripStore.cs', note: 'The only way to read or change trip data.' },
              { label: 'JsonTripStore', path: 'src/CharterTrip.Infrastructure/Storage/JsonTripStore.cs', note: 'In-memory document, debounced atomic saves, backups, migrations.' },
              { label: 'TripPermissions', path: 'src/CharterTrip.Web/Auth/TripPermissions.cs', note: 'What the viewer may do, cascaded to every page.' },
              { label: 'Program.cs', path: 'src/CharterTrip.Web/Program.cs', note: 'Composition root: storage, auth, data protection, health.' },
              { label: 'Itinerary.razor', path: 'src/CharterTrip.Web/Components/Pages/Itinerary.razor', note: 'Inline editing, reordering, drag and drop.' },
              { label: 'ReadOnlyTripStore', path: 'src/CharterTrip.Infrastructure/Storage/ReadOnlyTripStore.cs', note: 'What makes this public copy safe: every write refused at the source.' },
            ],
            body: ['Five files carry most of the design. The sixth is what lets the credentials above be printed at all.'],
          },
        ],
      },
    ],
  },
  {
    id: 'deploy',
    label: 'Deploy',
    color: '#d074f0',
    groups: [
      {
        id: 'deploy',
        label: 'Deploy',
        slides: [
          {
            id: 'dep-pipeline',
            title: 'Push to main, and it ships',
            diagram: 'deploy',
            body: [
              'GitHub Actions restores, builds, runs 756 tests, publishes, hands the build to Azure App Service, then curls the health endpoint to prove what landed is answering.',
              'A build that fails a test never deploys. Before the Azure secret existed the workflow stopped cleanly after the tests rather than failing the repository.',
            ],
          },
          {
            id: 'dep-appservice',
            title: 'One box, one instance, one folder that survives',
            body: [
              'App Service on the free tier. The data root is /home/data because almost everything else on the box is wiped by the next deploy.',
              'The app owns the file and holds the trip in memory, so it is locked to a single instance with autoscale off. Two instances would be two writers, and edits would quietly disappear.',
              'The free tier sleeps when idle, which is why the first visit takes a moment. For the weekend itself it moved up a tier with Always On, then back down.',
            ],
          },
          {
            id: 'dep-health',
            title: 'The health endpoint tells the truth',
            code: [
              { label: 'deploy.yml', path: '.github/workflows/deploy.yml', note: 'Build, test, publish, deploy, smoke test.' },
              { label: 'DEPLOY.md', path: 'docs/DEPLOY.md', note: 'The Azure setup, start to finish.' },
              { label: 'ARCHITECTURE.md', path: 'docs/ARCHITECTURE.md', note: 'Why the code is shaped the way it is.' },
            ],
            body: [
              'Alive is the easy half. The endpoint also reports whether the store can persist, whether it started from the built-in seed, and whether this deployment is read-only.',
              'A store that seeded because it could not find its file serves a perfect-looking site and loses every edit on restart. Reporting that is what makes it visible from a single curl.',
            ],
          },
        ],
      },
    ],
  },
]

/** Every slide in order, so Back and Next run through the whole tour. */
export const flatSlides = sections.flatMap((section) =>
  section.groups.flatMap((group) => group.slides.map((slide) => ({ section, group, slide }))),
)

export const indexOfGroup = (sectionId: string, groupId: string) =>
  Math.max(0, flatSlides.findIndex((f) => f.section.id === sectionId && f.group.id === groupId))
