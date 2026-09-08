import { useEffect, useRef, useState } from 'react'
import { Button, Frame, Icons } from '@duckdgoose/win95-ui'
import type { Project } from '../../content/projects'
import { charterTrip } from '../../content/charterTrip'
import { CharterTripShowcase } from './CharterTripShowcase'
import { GitHubTab } from './GitHubTab'

/** How long to wait before suggesting the app is cold-starting rather than broken. */
const SLOW_LOAD_MS = 8_000

function Details({ project }: { project: Project }) {
  const Icon = Icons[project.icon]
  return (
    <Frame boxShadow="$in" bgColor="white" className="min-h-0 flex-1 overflow-auto p-3 text-[11px]">
      <header className="mb-3 flex items-center gap-3">
        <Icon variant="32x32_4" />
        <div>
          <h1 className="text-[14px] font-bold">{project.name}</h1>
          <p className="opacity-70">
            {project.kind} · {project.status}
          </p>
        </div>
      </header>
      {project.body.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mb-2">
          {paragraph}
        </p>
      ))}
      <p className="mt-3 mb-1 font-bold">Built with</p>
      <ul className="list-disc pl-5">
        {project.tech.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Frame>
  )
}

/**
 * The live project, framed.
 *
 * Two things this cannot know, which is why the escape hatch and the slow-load note both exist:
 * an iframe fires `load` whether the page rendered or the browser refused to frame it, and a
 * free-tier app can take ~30s to cold start. Either way the visitor sees an empty box, so the
 * address strip always offers a way out to a real tab.
 */
function Embed({ project, url }: { project: Project; url: string }) {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    timer.current = window.setTimeout(() => setSlow(true), SLOW_LOAD_MS)
    return () => window.clearTimeout(timer.current)
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Address strip. Doubles as the escape hatch when the frame comes up empty. */}
      <Frame
        boxShadow="$in"
        bgColor="white"
        className="mb-[2px] flex items-center gap-2 px-1 py-[2px] text-[11px]"
      >
        <span className="shrink-0 opacity-70">Address</span>
        <span className="min-w-0 flex-1 truncate">{url}</span>
        <a href={url} target="_blank" rel="noreferrer noopener" className="shrink-0 underline">
          Open in new tab
        </a>
      </Frame>

      <div className="relative min-h-0 flex-1">
        <iframe
          src={url}
          title={`${project.name} (live site)`}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full border-0 bg-white"
          // allow-same-origin is required or the framed app cannot open its own SignalR
          // connection back to its origin, which breaks Blazor Server entirely.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-[11px]">
            <div>
              <p className="mb-1">Loading {project.name}…</p>
              {slow && (
                <p className="opacity-70">
                  Still waking up. Free hosting sleeps when idle, so the first visit can take
                  around half a minute.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * The Live tab for a project whose server refuses to be framed. An iframe would show only the
 * browser's "refused to connect" page, and nothing on this side can detect or override that:
 * the refusal is a response header from the other server. So say so, and open it properly.
 */
function LaunchCard({ project, url }: { project: Project; url: string }) {
  const Icon = Icons[project.icon]
  return (
    <Frame
      boxShadow="$in"
      bgColor="white"
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-auto p-6 text-center text-[11px]"
      data-dg="project-launch"
    >
      <Icon variant="32x32_4" />
      <p className="m-0 max-w-[380px]">
        {project.name} runs on its own server, and that server currently tells browsers not to
        show it inside another site. Until that changes, it opens in a tab of its own.
      </p>
      <Button className="h-[24px] px-4" onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
        Open {project.name}
      </Button>
      <span className="max-w-full truncate opacity-60">{url}</span>
    </Frame>
  )
}

type TabId = 'live' | 'tour' | 'github' | 'about'

const TABS: { id: TabId; label: string; color: string }[] = [
  { id: 'live', label: 'Live', color: '#20d6b0' },
  { id: 'tour', label: 'Tour', color: '#5aa6ff' },
  { id: 'github', label: 'GitHub', color: '#a98cff' },
  { id: 'about', label: 'About this project', color: '#ffa62e' },
]

export function ProjectWindow({ project }: { project: Project }) {
  const showcaseOn = !!project.showcase
  const [tab, setTab] = useState<TabId>(showcaseOn ? 'tour' : 'live')
  // Nothing deployed and nothing to show off: the writeup is the whole window.
  if (!project.liveUrl && !showcaseOn) return <Details project={project} />

  const tabs = TABS.filter((t) => {
    if (t.id === 'live') return !!project.liveUrl
    if (t.id === 'tour' || t.id === 'github') return showcaseOn
    return true
  })
  const url = project.liveUrl ?? ''

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex gap-[7px] px-[7px] pt-[6px]" role="tablist">
        {tabs.map((t) => {
          const selected = t.id === tab
          return (
            <Button
              key={t.id}
              role="tab"
              aria-selected={selected}
              boxShadow={selected ? '$in' : '$out'}
              className="h-[24px] text-[12px]"
              // Selected shows the colour; the rest are mixed most of the way back to the
              // Windows grey, so the strip reads as one control rather than four applications.
              //
              // The flat vertical padding is deliberate. React95's button swaps its top and
              // bottom padding over while pressed, which on a tab — where pressed is a state
              // that stays — reads as the label dropping to the bottom of the tab and living
              // there. Centring the label with flex keeps selection to weight and colour.
              style={{
                background: selected ? t.color : `color-mix(in srgb, ${t.color} 58%, #c3c7cb)`,
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                paddingTop: 0,
                paddingBottom: 0,
                paddingInline: 14,
              }}
              data-tutorial={`project-tab-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {/* Its own line box, so the label is the same height selected or not. See the note
                  on TabLabel in CharterTripShowcase. */}
              <span style={{ lineHeight: 1, fontWeight: selected ? 700 : 400 }}>{t.label}</span>
            </Button>
          )
        })}
      </div>
      <div className="mt-[9px] flex min-h-0 flex-1 flex-col px-[7px] pb-[7px]">
        {/* Every tab stays mounted: switching must not reload the framed app and pay the cold
            start again, and the showcase keeps its slide. */}
        {project.liveUrl && (
          <div className={tab === 'live' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            {project.embed ? <Embed project={project} url={url} /> : <LaunchCard project={project} url={url} />}
          </div>
        )}
        {showcaseOn && (
          <div className={tab === 'tour' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <CharterTripShowcase />
          </div>
        )}
        {showcaseOn && (
          <div className={tab === 'github' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <GitHubTab repo={project.repoUrl ?? charterTrip.repo} site={url || charterTrip.site} />
          </div>
        )}
        <div className={tab === 'about' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
          <Details project={project} />
        </div>
      </div>
    </div>
  )
}
