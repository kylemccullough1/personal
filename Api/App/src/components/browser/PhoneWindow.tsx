import { Frame, Icons } from '@duckdgoose/win95-ui'
import { site } from '../../content/site'

/** A small dialog for the Phone desktop icon. */
export function PhoneWindow() {
  return (
    <Frame className="flex flex-1 items-center gap-3 p-3 text-[11px]">
      <Icons.Phone variant="32x32_4" />
      <div>
        <p className="font-bold">{site.owner}</p>
        <p>{site.contact.phone}</p>
        <p className="mt-1 opacity-70">Prefer email? Open Contact from the Start menu.</p>
      </div>
    </Frame>
  )
}
