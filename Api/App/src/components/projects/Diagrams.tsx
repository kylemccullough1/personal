import type { ReactNode } from 'react'
import type { DiagramKind } from '../../content/charterTrip'

/*
 * Diagrams for the backend and deploy slides.
 *
 * SVG rather than nested divs: a diagram has to hold its proportions as the window is resized,
 * and a viewBox does that for free where a flex layout reflows and breaks the arrows. Drawn in
 * the site's own palette — Windows 95 grey chrome, navy title bars, a teal accent for the thing
 * each picture is actually about — so they belong to the desktop around them rather than
 * looking like clip art dropped into it.
 */

const NAVY = '#000080'
const TEAL = '#008080'
const GREY = '#c0c0c0'
const INK = '#000'

/** A raised Windows 95 panel with a title bar, drawn by hand so it scales with the viewBox. */
function Panel({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  accent = NAVY,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  lines?: string[]
  accent?: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={GREY} stroke={INK} strokeWidth={1} />
      {/* The three-tone bevel: light top-left, dark bottom-right. */}
      <path d={`M${x} ${y + h}V${y}H${x + w}`} stroke="#fff" strokeWidth={2} fill="none" />
      <path d={`M${x} ${y + h}H${x + w}V${y}`} stroke="#7b7b7b" strokeWidth={2} fill="none" />
      <rect x={x + 4} y={y + 4} width={w - 8} height={16} fill={accent} />
      <text x={x + 8} y={y + 16} fill="#fff" fontSize={11} fontWeight="bold">
        {title}
      </text>
      {lines.map((line, i) => (
        <text key={line} x={x + 8} y={y + 36 + i * 13} fill={INK} fontSize={10.5}>
          {line}
        </text>
      ))}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={2} markerEnd="url(#dg-arrow)" />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 6}
          fill={TEAL}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

function Canvas({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full"
      style={{ fontFamily: 'inherit' }}
      role="img"
    >
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={INK} />
        </marker>
      </defs>
      {children}
    </svg>
  )
}

const Note = ({ x, y, children }: { x: number; y: number; children: string }) => (
  <text x={x} y={y} fill="#404040" fontSize={10} fontStyle="italic">
    {children}
  </text>
)

function Projects() {
  return (
    <Canvas width={700} height={210}>
      <Panel x={10} y={20} w={200} h={92} title="CharterTrip.Web" lines={['Pages, layouts,', 'components']} />
      <Panel
        x={250}
        y={20}
        w={200}
        h={92}
        title="Infrastructure"
        lines={['JSON store, backups,', 'photos on disk']}
      />
      <Panel x={490} y={20} w={200} h={92} title="CharterTrip.Core" lines={['Models, rules,', 'interfaces']} accent={TEAL} />
      <Arrow x1={214} y1={66} x2={246} y2={66} />
      <Arrow x1={454} y1={66} x2={486} y2={66} />
      <Note x={10} y={140}>
        References point one way only.
      </Note>
      <Note x={490} y={140}>
        Knows nothing: no ASP.NET,
      </Note>
      <Note x={490} y={154}>
        no filesystem, no browser.
      </Note>
      <line x1={490} y1={112} x2={560} y2={132} stroke="#808080" strokeWidth={1} strokeDasharray="3 3" />
      <Note x={10} y={182}>
        A SqlTripStore would live in the middle box. The other two never find out.
      </Note>
    </Canvas>
  )
}

function WritePath() {
  return (
    <Canvas width={700} height={330}>
      <Panel x={210} y={8} w={280} h={44} title="A page calls MutateAsync(...)" accent={TEAL} />
      <Arrow x1={350} y1={54} x2={350} y2={78} />
      <Panel x={210} y={80} w={280} h={56} title="Take the lock" lines={['Two edits can never interleave']} />
      <Arrow x1={350} y1={138} x2={350} y2={162} />
      <Panel x={210} y={164} w={280} h={56} title="Apply, bump Revision" lines={['The in-memory trip is the truth']} />
      <Arrow x1={310} y1={222} x2={190} y2={252} />
      <Arrow x1={390} y1={222} x2={510} y2={252} />
      <Panel x={20} y={254} w={280} h={62} title="Debounced save" lines={['temp file, fsync, rename —', 'a crash cannot truncate it']} />
      <Panel x={400} y={254} w={280} h={62} title="Changed(area)" lines={['Only pages watching that area', 're-render']} accent={TEAL} />
    </Canvas>
  )
}

function Auth() {
  return (
    <Canvas width={700} height={300}>
      <Panel x={10} y={8} w={210} h={62} title="Committee" lines={['username + password', 'stored as PBKDF2 hashes']} />
      <Panel x={245} y={8} w={210} h={62} title="Personal link" lines={['/join/{token} from a QR code']} />
      <Panel x={480} y={8} w={210} h={62} title="Buzzer code" lines={['a team, or the host job']} />
      <Arrow x1={115} y1={72} x2={300} y2={106} />
      <Arrow x1={350} y1={72} x2={350} y2={106} />
      <Arrow x1={585} y1={72} x2={400} y2={106} />
      <Panel
        x={190}
        y={108}
        w={320}
        h={60}
        title="One encrypted cookie"
        lines={['Keys persisted beside trip.json, so a', 'sign-in survives a restart and a deploy']}
      />
      <Arrow x1={350} y1={170} x2={350} y2={196} />
      <Panel
        x={120}
        y={198}
        w={460}
        h={78}
        title="TripPermissions"
        lines={[
          'IsAdmin · CanEdit · PersonId · TeamId · IsBuzzerHost · IsBeeHost',
          'Cascaded from the layout, so no page injects anything to ask.',
          'CanEdit is false for everyone while the site is read-only.',
        ]}
        accent={TEAL}
      />
    </Canvas>
  )
}

function LiveUpdates() {
  return (
    <Canvas width={700} height={300}>
      <Panel x={10} y={16} w={190} h={62} title="A phone" lines={['taps “award point”']} />
      <Arrow x1={204} y1={47} x2={252} y2={47} label="WebSocket" />
      <Panel
        x={256}
        y={16}
        w={210}
        h={62}
        title="The server"
        lines={['the page object lives here;', 'your C# runs on it']}
        accent={TEAL}
      />
      <Arrow x1={470} y1={47} x2={518} y2={47} />
      <Panel x={522} y={16} w={168} h={62} title="trip.json" lines={['one writer, in memory']} />
      <Arrow x1={360} y1={80} x2={360} y2={112} label="Changed" />
      <Panel x={230} y={114} w={260} h={44} title="Every open circuit is notified" />
      {[40, 200, 360, 520].map((x, i) => (
        <g key={x}>
          <Arrow x1={360} y1={160} x2={x + 60} y2={192} />
          <Panel x={x} y={194} w={120} h={54} title={i === 3 ? 'Phone 26' : `Phone ${i + 1}`} lines={['diffed HTML']} />
        </g>
      ))}
      <Note x={10} y={278}>
        No REST layer and no client state: the diff is the only thing on the wire.
      </Note>
    </Canvas>
  )
}

function Deploy() {
  return (
    <Canvas width={700} height={250}>
      <Panel x={8} y={20} w={150} h={54} title="git push main" />
      <Arrow x1={162} y1={47} x2={196} y2={47} />
      <Panel x={200} y={20} w={170} h={54} title="GitHub Actions" lines={['restore · build · test']} />
      <Arrow x1={374} y1={47} x2={408} y2={47} label="756 pass" />
      <Panel x={412} y={20} w={140} h={54} title="Publish" />
      <Arrow x1={556} y1={47} x2={590} y2={47} />
      <Panel x={594} y={20} w={98} h={54} title="Azure" accent={TEAL} />
      <Arrow x1={643} y1={76} x2={643} y2={104} />
      <Panel x={520} y={106} w={172} h={54} title="curl /healthz" lines={['smoke test']} />
      <Panel
        x={8}
        y={106}
        w={480}
        h={72}
        title="App Service: one instance, autoscale off"
        lines={[
          '/home/data survives a deploy — trip.json, its backups and uploads live there.',
          'Everything else on the box is wiped by the next push.',
          'Two instances would be two writers, and edits would vanish.',
        ]}
      />
      <Note x={200} y={196}>
        A build that fails a test never reaches Azure.
      </Note>
    </Canvas>
  )
}

export function Diagram({ kind }: { kind: DiagramKind }) {
  switch (kind) {
    case 'projects':
      return <Projects />
    case 'writePath':
      return <WritePath />
    case 'auth':
      return <Auth />
    case 'liveUpdates':
      return <LiveUpdates />
    case 'deploy':
      return <Deploy />
  }
}
