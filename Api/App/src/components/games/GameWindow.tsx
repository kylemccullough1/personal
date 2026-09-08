import { Frame, Icons } from '@duckdgoose/win95-ui'
import type { Game } from '../../content/games'

/**
 * A game's window, in stub form: what it is and how it is built. The playable version
 * replaces this once the C# game logic is exposed through the API.
 */
export function GameWindow({ game }: { game: Game }) {
  const Icon = Icons[game.icon]
  return (
    <Frame boxShadow="$in" bgColor="white" className="min-h-0 flex-1 overflow-auto p-3 text-[11px]">
      <header className="mb-3 flex items-center gap-3">
        <Icon variant="32x32_4" />
        <div>
          <h1 className="text-[14px] font-bold">{game.name}</h1>
          <p className="opacity-70">{game.kind}</p>
        </div>
      </header>
      {game.body.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mb-2">
          {paragraph}
        </p>
      ))}
      <p className="mt-3 mb-1 font-bold">Built with</p>
      <ul className="mb-3 list-disc pl-5">
        {game.tech.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Frame boxShadow="$out" className="p-2">
        Playable version coming to duckdgoose. The game engine is moving into the site's own API.
      </Frame>
    </Frame>
  )
}
