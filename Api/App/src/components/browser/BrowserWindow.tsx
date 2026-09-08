import { useEffect, useState } from 'react'
import { Button, Frame } from '@duckdgoose/win95-ui'
import { AboutTab } from './AboutTab'
import { ContactTab } from './ContactTab'

export type BrowserTab = 'about' | 'contact'

const TABS: { id: BrowserTab; label: string; path: string }[] = [
  { id: 'about', label: 'About', path: '/about' },
  { id: 'contact', label: 'Contact', path: '/contact' },
]

/**
 * A 1997-looking browser. Toolbar, address bar, a tab strip, and the page. `tab` is the tab
 * to show when (re)opened; the Email icon reopens this window pointed at Contact, and the
 * effect below is what makes that switch even when the window is already open.
 */
export function BrowserWindow({ tab }: { tab: BrowserTab }) {
  const [active, setActive] = useState<BrowserTab>(tab)
  useEffect(() => setActive(tab), [tab])
  const current = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col text-[11px]" data-dg="browser">
      <Frame className="flex items-center gap-1 px-1 py-[2px]">
        {['Back', 'Forward', 'Stop', 'Refresh', 'Home'].map((label) => (
          <Button key={label} disabled={label !== 'Home'} className="h-[20px] px-2" onClick={() => setActive('about')}>
            {label}
          </Button>
        ))}
      </Frame>
      <Frame className="flex items-center gap-2 px-1 py-[2px]">
        <span>Address</span>
        <Frame boxShadow="$in" bgColor="white" className="flex h-[20px] flex-1 items-center px-1">
          http://www.duckdgoose.net{current.path}
        </Frame>
      </Frame>
      <div className="flex gap-[2px] px-1 pt-1" role="tablist">
        {TABS.map((t) => (
          <Button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            // React95's Button takes FrameProps, not an `active` prop; passing one leaks an
            // invalid `active` attribute to the DOM and warns. boxShadow is the pressed look.
            boxShadow={t.id === active ? '$in' : '$out'}
            className="h-[20px] px-3"
            data-tutorial={`browser-tab-${t.id}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <Frame boxShadow="$in" bgColor="white" className="mt-[2px] min-h-0 flex-1 overflow-auto p-3">
        {active === 'about' ? <AboutTab /> : <ContactTab />}
      </Frame>
      <Frame boxShadow="$in" className="mt-[2px] px-[6px] py-[2px]">
        Done
      </Frame>
    </div>
  )
}
