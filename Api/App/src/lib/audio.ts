/*
 * The machine's noise: a power-on swell and a hum that runs while the site is open.
 *
 * Web Audio rather than <audio loop>, for one reason that matters: an MP3 carries encoder
 * padding at both ends, so looping the element leaves an audible click every twenty seconds.
 * A decoded AudioBuffer can be looped between two arbitrary points, so loopStart and loopEnd
 * are set just inside the padding and the seam disappears. The clip itself was crossfaded onto
 * itself when it was cut, so the two ends already match.
 *
 * Autoplay: a browser will not start audio before the visitor has interacted with the page, and
 * an AudioContext created without a gesture is born suspended. So the context is resumed on the
 * first pointer or key event, and the taskbar's speaker button is the manual way in and out.
 */

const HUM_URL = '/audio/pc-hum.mp3'
const POWER_ON_URL = '/audio/pc-power-on.mp3'

/** Where the loop points sit, in seconds, inside the decoded buffer. */
const LOOP_EDGE = 0.06

const MUTED_KEY = 'dg.audio.muted'
const HUM_VOLUME = 0.28
const POWER_ON_VOLUME = 0.55

function readMuted(): boolean {
  try {
    // Default is on: the hum is the point. Anyone who turns it off is remembered.
    return localStorage.getItem(MUTED_KEY) === '1'
  } catch {
    return false
  }
}

type State = {
  ctx: AudioContext | null
  master: GainNode | null
  hum: AudioBufferSourceNode | null
  humGain: GainNode | null
  buffers: Map<string, AudioBuffer>
  muted: boolean
  started: boolean
}

const state: State = {
  ctx: null,
  master: null,
  hum: null,
  humGain: null,
  buffers: new Map(),
  muted: readMuted(),
  started: false,
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export const audioStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  isMuted: () => state.muted,
}

function context(): AudioContext | null {
  if (state.ctx) return state.ctx
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  const ctx = new Ctor()
  const master = ctx.createGain()
  master.gain.value = state.muted ? 0 : 1
  master.connect(ctx.destination)
  state.ctx = ctx
  state.master = master
  return ctx
}

async function load(url: string): Promise<AudioBuffer | null> {
  const cached = state.buffers.get(url)
  if (cached) return cached
  const ctx = context()
  if (!ctx) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer())
    state.buffers.set(url, buffer)
    return buffer
  } catch {
    // No sound is a perfectly good outcome; never let it break the page.
    return null
  }
}

/** Resume the context. Safe to call repeatedly; only a user gesture will actually succeed. */
export function resumeAudio() {
  const ctx = context()
  if (ctx && ctx.state === 'suspended') void ctx.resume()
}

/** One-shot: the monitor coming on. */
export async function playPowerOn() {
  const ctx = context()
  const buffer = await load(POWER_ON_URL)
  if (!ctx || !buffer || !state.master) return
  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  gain.gain.value = POWER_ON_VOLUME
  source.buffer = buffer
  source.connect(gain).connect(state.master)
  source.start()
}

/** The running machine. Idempotent: the second call does nothing. */
export async function startHum() {
  if (state.started) return
  state.started = true
  const ctx = context()
  const buffer = await load(HUM_URL)
  if (!ctx || !buffer || !state.master) return

  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  source.buffer = buffer
  source.loop = true
  source.loopStart = LOOP_EDGE
  source.loopEnd = Math.max(LOOP_EDGE + 1, buffer.duration - LOOP_EDGE)
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(HUM_VOLUME, ctx.currentTime + 2.5)
  source.connect(gain).connect(state.master)
  source.start()
  state.hum = source
  state.humGain = gain
}

export function setMuted(muted: boolean) {
  state.muted = muted
  try {
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0')
  } catch {
    /* storage unavailable; the choice simply does not persist */
  }
  const ctx = context()
  if (ctx && state.master) {
    // A ramp rather than a jump: a gain that snaps to zero clicks.
    state.master.gain.cancelScheduledValues(ctx.currentTime)
    state.master.gain.setValueAtTime(state.master.gain.value, ctx.currentTime)
    state.master.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.15)
  }
  if (!muted) resumeAudio()
  notify()
}

/** Resume on the first interaction, which is the only moment a browser will allow it. */
export function armAudioOnFirstGesture() {
  const events = ['pointerdown', 'keydown', 'touchstart'] as const
  const once = () => {
    resumeAudio()
    events.forEach((e) => window.removeEventListener(e, once))
  }
  events.forEach((e) => window.addEventListener(e, once, { passive: true }))
  return () => events.forEach((e) => window.removeEventListener(e, once))
}
