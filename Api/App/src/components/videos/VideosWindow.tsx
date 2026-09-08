import { Frame, Icons } from '@duckdgoose/win95-ui'

/** Stub. Movie Munch Off episodes will list here once there is a source for them. */
export function VideosWindow() {
  return (
    <Frame boxShadow="$in" bgColor="white" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-3 text-[11px]">
      <Icons.Videos variant="32x32_4" />
      <p className="font-bold">Videos</p>
      <p className="max-w-[40ch] text-center opacity-70">
        Movie Munch Off episodes will appear here. Nothing is wired up yet.
      </p>
    </Frame>
  )
}
