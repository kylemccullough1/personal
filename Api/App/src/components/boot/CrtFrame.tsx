import { useEffect, useRef, useState, type ReactNode } from 'react'
import { playPowerOn, startHum } from '../../lib/audio'

/*
 * The site runs inside a photograph of a real CRT in a real bedroom.
 *
 * Everything that is not the picture — the monitor, the lamp, the wall, the tapes, the bear —
 * is the photograph, because no amount of CSS gets to that and pretending otherwise was the
 * mistake in the previous two attempts. What CSS does here is exactly two things: hold the
 * photo at its own aspect ratio so nothing in it ever stretches, and put the live desktop in
 * the rectangle where the glass is.
 *
 * Holding the aspect ratio is the whole trick, and it is why the stage is sized with
 * `min(100vw, 100vh * ratio)` rather than `object-fit`. The desktop is positioned in percentages
 * of the stage, so those percentages are image pixels divided by image size and stay aligned at
 * every window size. `object-fit: contain` would letterbox inside a box that is still the full
 * container, and the percentages would drift away from the glass as the window changed shape.
 *
 * The overlays on top of the desktop are what make our pixels look like they were photographed
 * with the rest of it: the phosphor bloom, the scanlines, the lamp reflected in the glass at the
 * right, and the corner vignette, all sampled off the photo itself.
 */

/** The photograph, and where its screen sits inside it. Percentages of the image. */
const PHOTO = { src: '/room/crt-room.jpg', width: 1672, height: 940 }
const SCREEN = { left: 28.35, top: 14.7, width: 43.6, height: 54.4 }

/**
 * The monitor's plastic body — the border around the glass, not the stand it sits on. Its top
 * and bottom edges as percentages of the photo's height.
 *
 * These decide the vertical crop. The photo is zoomed to fill the window, which always makes it
 * taller than the window, and the only question left is where the overflow is taken from. It is
 * taken so that the case clears the top and bottom of the window by the same amount, which is
 * the framing that looks composed rather than accidental. The stand below the case is outside
 * this and is the first thing to go.
 */
const CASE = { top: 5.9, bottom: 84.0 }

/** Photo height when zoomed to fill the window; never shorter than the window itself. */
const STAGE_H = `max(100vw / ${PHOTO.width / PHOTO.height}, 100vh)`

/**
 * Vertical offset that centres the case. Clamped so it can never open a gap: 0 would show the
 * photo's top edge, and (100vh - stage height) is as far up as it can go before the bottom
 * edge appears.
 */
const STAGE_TOP = `clamp(calc(100vh - ${STAGE_H}), calc((100vh - ${STAGE_H} * ${(CASE.top + CASE.bottom) / 100}) / 2), 0px)`

/**
 * Sampled off the photograph: duller, softer, slightly warm, and very slightly out of focus.
 *
 * The blur is a third of a pixel, which is not enough to cost legibility but is enough to stop
 * our glyphs looking laser-printed next to a photographed screen. A shadow mask never resolved
 * a pixel perfectly, and the eye reads that softness as "this is a tube" more strongly than any
 * of the overlays do.
 */
const GRADE = 'saturate(0.74) contrast(0.86) brightness(0.97) sepia(0.14) blur(0.55px)'

type Phase = 'off' | 'line' | 'open' | 'on'

/** How long each stage of the switch-on lasts, in milliseconds. */
const LINE_MS = 260
const OPEN_MS = 520

export function CrtFrame({
  children,
  powerOn = false,
  onPoweredOn,
}: {
  children: ReactNode
  /** Play the switch-on. False goes straight to a lit screen. */
  powerOn?: boolean
  onPoweredOn?: () => void
}) {
  const [phase, setPhase] = useState<Phase>(powerOn ? 'off' : 'on')
  const doneRef = useRef(onPoweredOn)
  doneRef.current = onPoweredOn

  useEffect(() => {
    if (!powerOn) {
      void startHum()
      doneRef.current?.()
      return
    }
    const timers: number[] = []
    // A frame's delay before the first transition, or the browser collapses the whole
    // sequence into its first paint and nothing appears to animate.
    timers.push(window.setTimeout(() => setPhase('line'), 60))
    timers.push(window.setTimeout(() => setPhase('open'), 60 + LINE_MS))
    timers.push(
      window.setTimeout(() => {
        setPhase('on')
        doneRef.current?.()
      }, 60 + LINE_MS + OPEN_MS),
    )
    void playPowerOn()
    void startHum()
    return () => timers.forEach(clearTimeout)
  }, [powerOn])

  const lit = phase === 'open' || phase === 'on'

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: '#070603' }}
      data-dg="room"
    >
      {/* The photograph, zoomed to fill the window and cropped so the monitor's case sits the
          same distance from the top and the bottom. It always holds the photo's own ratio, which
          is what keeps the screen percentages welded to the glass. */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: STAGE_TOP,
          width: `max(100vw, calc(100vh * ${PHOTO.width} / ${PHOTO.height}))`,
          aspectRatio: `${PHOTO.width} / ${PHOTO.height}`,
          backgroundImage: `url('${PHOTO.src}')`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
        data-dg="stage"
      >
        {/* The glass. Black underneath at all times, so the desktop in the photograph never
            shows through ours — during the switch-on it would otherwise be sitting there
            already lit, which gives the whole thing away. */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${SCREEN.left}%`,
            top: `${SCREEN.top}%`,
            width: `${SCREEN.width}%`,
            height: `${SCREEN.height}%`,
            background: '#04100f',
            borderRadius: '2.2% / 3.4%',
          }}
          data-dg="glass"
        >
          {/* The picture. Squashes to a line and opens back out on power-on; once lit the
              transform is dropped so nothing downstream inherits a scaled box. */}
          {/* The colour grade is what marries our pixels to the photograph. A screen shot in a
              warm room through a 90s tube is duller, hazier and a touch yellower than the same
              colours on a monitor today, so the desktop is desaturated, softened in contrast and
              nudged warm before any of the glass overlays go on top.

              `filter` makes this element a containing block and a stacking context. Nothing
              inside uses position: fixed, and every z-index the desktop cares about is inside
              it, so the ordering is unchanged — but it is the reason the overlays below are
              siblings of this element rather than children of it. */}
          <div
            className="relative h-full w-full"
            style={
              phase === 'on'
                ? { background: 'var(--dg-screen-black)', filter: GRADE }
                : {
                    background: 'var(--dg-screen-black)',
                    transform: phase === 'off' ? 'scaleY(0.004)' : 'scaleY(1)',
                    opacity: phase === 'off' ? 0 : 1,
                    filter: phase === 'open' ? 'brightness(1.9) saturate(0.6)' : GRADE,
                    transition: `transform ${OPEN_MS}ms cubic-bezier(0.2,0.9,0.2,1), opacity 240ms ease-out, filter ${OPEN_MS}ms ease-out`,
                  }
            }
            data-dg="picture"
          >
            {children}
          </div>

          {/* The white line the picture grows out of. */}
          {phase !== 'on' && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[4%] top-1/2 -translate-y-1/2"
              style={{
                height: 2,
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 0 18px 4px rgba(180,255,255,0.75)',
                opacity: phase === 'off' ? 0 : phase === 'line' ? 1 : 0,
                transition: 'opacity 200ms ease-out',
                zIndex: 3_950_000,
              }}
            />
          )}

          {/* Phosphor bloom, the lamp in the glass, and the corner falloff. Values sampled off
              the photograph: the tube is hazier and less saturated than a monitor today, and
              its right-hand side carries the lamp. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 3_900_000,
              opacity: lit ? 1 : 0,
              transition: 'opacity 700ms ease-out',
              background: [
                // Bloom. Phosphor spills, so the middle of the tube is not just brighter than
                // its edges, it is hazier: a wide soft lift over the centre two thirds.
                'radial-gradient(72% 62% at 50% 48%, rgba(180,255,246,0.17) 0%, rgba(150,240,235,0.07) 45%, rgba(0,0,0,0) 78%)',
                // The lamp, sitting in the glass on the right.
                'radial-gradient(48% 74% at 100% 34%, rgba(255,186,104,0.17) 0%, rgba(255,170,80,0.05) 45%, rgba(0,0,0,0) 78%)',
                // The fade. Four stops rather than two, because a tube does not fall off evenly:
                // it holds across the middle, drops through the last third, and goes furthest of
                // all in the corners, where the beam has the longest way to travel.
                'radial-gradient(92% 88% at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.10) 58%, rgba(0,0,0,0.30) 76%, rgba(0,0,0,0.58) 90%, rgba(0,0,0,0.82) 100%)',
              ].join(', '),
            }}
          />
          {/* Scanlines. The photo has them fine and low-contrast; anything stronger and the
              taskbar text starts to shimmer. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 3_900_001,
              opacity: lit ? 1 : 0,
              transition: 'opacity 700ms ease-out',
              background:
                'repeating-linear-gradient(to bottom, rgba(0,0,0,0.11) 0px, rgba(0,0,0,0.11) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)',
              mixBlendMode: 'multiply',
            }}
          />
          {/* Convergence error. A tube's three beams never landed on quite the same spot, and
              the further from the centre the worse it got, so the edges of the picture carry a
              colour fringe — cool on one side, warm on the other. Two gradients screened over
              the top is the cheap version of that, and unlike a real channel-offset filter it
              costs nothing per frame and never touches the sharpness of the text. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 3_900_002,
              opacity: lit ? 1 : 0,
              transition: 'opacity 700ms ease-out',
              mixBlendMode: 'screen',
              background: [
                'linear-gradient(90deg, rgba(60,150,255,0.14) 0%, rgba(60,150,255,0.04) 3%, rgba(0,0,0,0) 9%)',
                'linear-gradient(270deg, rgba(255,110,70,0.13) 0%, rgba(255,110,70,0.04) 3%, rgba(0,0,0,0) 9%)',
                'linear-gradient(180deg, rgba(120,255,220,0.07) 0%, rgba(0,0,0,0) 6%)',
                'linear-gradient(0deg, rgba(255,140,90,0.07) 0%, rgba(0,0,0,0) 6%)',
              ].join(', '),
            }}
          />
          {/* The haze on the glass itself: a flat, very slight lift that takes the digital edge
              off the colours underneath and matches the photographed screen's black level. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 3_900_003,
              background: 'rgba(190,235,225,0.055)',
              opacity: lit ? 1 : 0,
              transition: 'opacity 700ms ease-out',
            }}
          />
        </div>
      </div>
    </div>
  )
}
