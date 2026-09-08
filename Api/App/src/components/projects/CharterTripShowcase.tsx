import { useState, type CSSProperties } from 'react'
import { Button, Frame } from '@duckdgoose/win95-ui'
import { charterTrip, flatSlides, indexOfGroup, sections, type Slide } from '../../content/charterTrip'
import { Diagram } from './Diagrams'

function Credentials() {
  const { username, password } = charterTrip.credentials
  return (
    <Frame boxShadow="$out" bgColor="$material" className="flex flex-wrap items-center gap-x-6 gap-y-1 p-2">
      <span className="font-bold">Sign in and look around</span>
      <span>
        Username <code className="font-mono">{username}</code>
      </span>
      <span>
        Password <code className="font-mono">{password}</code>
      </span>
      <a href={`${charterTrip.site}/login`} target="_blank" rel="noreferrer noopener" className="underline">
        Open the sign-in page
      </a>
    </Frame>
  )
}

function SlideBody({ slide }: { slide: Slide }) {
  return (
    <>
      {slide.credentials && <Credentials />}
      {slide.image && (
        <Frame boxShadow="$in" bgColor="black" className="p-[2px]">
          <img
            src={`/showcase/charter-trip/${slide.image}`}
            alt={slide.title}
            className="block h-auto w-full"
            style={{ imageRendering: 'auto' }}
          />
        </Frame>
      )}
      {slide.pending && (
        <Frame
          boxShadow="$in"
          bgColor="$material"
          className="flex min-h-[120px] items-center justify-center p-4 text-center opacity-70"
        >
          {slide.pending}
        </Frame>
      )}
      {slide.diagram && (
        <Frame boxShadow="$in" bgColor="white" className="p-3">
          <Diagram kind={slide.diagram} />
        </Frame>
      )}
      {slide.body?.map((p) => (
        <p key={p.slice(0, 40)} className="m-0">
          {p}
        </p>
      ))}
      {slide.code && (
        <table className="w-full border-collapse">
          <tbody>
            {slide.code.map((c) => (
              <tr key={c.path}>
                <td className="whitespace-nowrap py-[3px] pr-3 align-top">
                  <a href={charterTrip.file(c.path)} target="_blank" rel="noreferrer noopener" className="underline">
                    {c.label}
                  </a>
                </td>
                <td className="py-[3px] align-top">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

/** The Windows 95 button face, which every unselected tab is mixed back towards. */
const MATERIAL = '#c3c7cb'

/**
 * The look of a tab.
 *
 * Colour: selected is the colour itself; unselected is that colour a little over half way out of
 * the grey, which is enough to tell two neighbours apart at a glance and not enough to make the
 * strip look like a row of buttons from six different applications. Both stay light, because the
 * label on top is black and the window this sits in is a 1995 dialog, not a dark theme.
 *
 * Padding: set here rather than left to the library, and that is the whole point of it being
 * here. React95's button ships asymmetric vertical padding and then swaps the two halves over
 * when the button is pressed, which is a faithful 1995 detail on a button you push and let go of.
 * On a tab, where "pressed" is a state that lasts, it reads as the label sliding to the bottom of
 * the tab and staying there. So the label is centred by flex and the padding is pinned flat, and
 * selection is carried by weight and colour alone.
 */
function tabStyle(color: string | undefined, selected: boolean, inline: number): CSSProperties {
  return {
    background: color ? (selected ? color : `color-mix(in srgb, ${color} 58%, ${MATERIAL})`) : undefined,
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingInline: inline,
  }
}

/**
 * The label inside a tab.
 *
 * A span with its own line box, rather than a bare string. Left bare, the text is an anonymous
 * flex item whose height comes from the font's own line box, and that box lands half a pixel off
 * centre in one state and dead centre in the other — which is exactly the drift the eye picks up
 * as the label sinking when a tab is chosen. Giving it a span with line-height 1 makes the two
 * states the same box, so bold is the only thing that changes.
 */
function TabLabel({ selected, children }: { selected: boolean; children: string }) {
  return <span style={{ lineHeight: 1, fontWeight: selected ? 700 : 400 }}>{children}</span>
}

/**
 * The Tour tab of the Charter Trip window.
 *
 * The section list is inside the content panel rather than a second row of tabs under the
 * window's own — two tab strips stacked on each other read as one confusing group, and the
 * sections are navigation within this document, not more windows. A section with more than one
 * group (UI tour has User and Admin) gets sub-tabs above the slide.
 *
 * Back and Next run through every slide in order, so the whole thing can also be read straight
 * through without touching the navigation.
 */
export function CharterTripShowcase() {
  const [index, setIndex] = useState(0)
  const current = flatSlides[Math.min(index, flatSlides.length - 1)]
  const isFirst = index === 0
  const isLast = index >= flatSlides.length - 1
  const groupStart = indexOfGroup(current.section.id, current.group.id)
  const position = index - groupStart + 1

  return (
    <div className="flex min-h-0 flex-1 flex-col text-[11px]" data-dg="showcase">
      <div className="flex min-h-0 flex-1">
        {/* Sections, down the side of the document. */}
        <Frame
          boxShadow="$in"
          bgColor="$material"
          className="flex w-[140px] shrink-0 flex-col gap-[7px] p-[7px]"
          role="tablist"
          aria-label="Tour sections"
        >
          {sections.map((s) => {
            const selected = s.id === current.section.id
            return (
              <Button
                key={s.id}
                role="tab"
                aria-selected={selected}
                boxShadow={selected ? '$in' : '$out'}
                className="h-[24px] w-full shrink-0 text-left text-[12px]"
                style={tabStyle(s.color, selected, 10)}
                data-tutorial={`showcase-tab-${s.id}`}
                onClick={() => setIndex(indexOfGroup(s.id, s.groups[0].id))}
              >
                <TabLabel selected={selected}>{s.label}</TabLabel>
              </Button>
            )
          })}
          <span className="mt-auto px-1 pb-1 opacity-60">
            {index + 1} of {flatSlides.length}
          </span>
        </Frame>

        {/* The same top inset the section rail gives its own first button, so the group tabs sit
            on the same line as the section tabs beside them rather than a few pixels above. */}
        <div className="ml-[5px] flex min-h-0 flex-1 flex-col pt-[7px]">
          {current.section.groups.length > 1 && (
            <div
              className="mb-[6px] flex flex-wrap gap-[7px]"
              role="tablist"
              aria-label={`${current.section.label} views`}
            >
              {current.section.groups.map((g) => {
                const selected = g.id === current.group.id
                return (
                  <Button
                    key={g.id}
                    role="tab"
                    aria-selected={selected}
                    boxShadow={selected ? '$in' : '$out'}
                    className="h-[24px] text-[12px]"
                    style={tabStyle(g.color ?? current.section.color, selected, 14)}
                    data-tutorial={`showcase-group-${g.id}`}
                    onClick={() => setIndex(indexOfGroup(current.section.id, g.id))}
                  >
                    <TabLabel selected={selected}>{g.label}</TabLabel>
                  </Button>
                )
              })}
            </div>
          )}

          <Frame
            boxShadow="$in"
            bgColor="white"
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3"
          >
            <h2 className="m-0 text-[13px] font-bold">{current.slide.title}</h2>
            <SlideBody slide={current.slide} />
          </Frame>
        </div>
      </div>

      <Frame boxShadow="$in" className="mt-[3px] flex items-center gap-2 px-[6px] py-[3px]">
        <span className="mr-auto opacity-70">
          {current.section.label}
          {current.section.groups.length > 1 ? ` · ${current.group.label}` : ''} · {position} of{' '}
          {current.group.slides.length}
        </span>
        <Button className="h-[22px] px-3" disabled={isFirst} onClick={() => setIndex(index - 1)}>
          Back
        </Button>
        <Button className="h-[22px] px-3" disabled={isLast} onClick={() => setIndex(index + 1)}>
          Next
        </Button>
      </Frame>
    </div>
  )
}
