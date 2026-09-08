import { useState, type FormEvent } from 'react'
import { Button, Fieldset, Input, TextArea } from '@duckdgoose/win95-ui'
import { site } from '../../content/site'

type Status = 'idle' | 'sent'

/**
 * Contact details and the message form, stacked: details first, then the form underneath.
 * Side by side, both columns were too narrow to read at the width this window opens at, and
 * the form's labels wrapped. One column each, full width, in reading order.
 *
 * The form is a working stub: it validates and shows a confirmation, but nothing leaves the
 * browser yet. The .NET API's POST /api/contact is the planned destination.
 */
export function ContactTab() {
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: POST /api/contact via TanStack Query mutation.
    setStatus('sent')
  }

  return (
    <div className="flex max-w-[70ch] flex-col gap-4">
      <section>
        <h1 className="mb-2 text-[14px] font-bold">Get in touch</h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="font-bold">Email</dt>
          <dd>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </dd>
          <dt className="font-bold">Phone</dt>
          <dd>{site.contact.phone}</dd>
          <dt className="font-bold">Location</dt>
          <dd>{site.contact.location}</dd>
        </dl>
        <ul className="mt-3 list-disc pl-4">
          {site.contact.links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={onSubmit} data-tutorial="contact-form">
        <Fieldset legend="Send a message">
          {status === 'sent' ? (
            <p>
              Thanks. The message form is not connected yet, so nothing was actually sent. Use the email
              address for now.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                Your name
                <Input name="name" required />
              </label>
              <label className="flex flex-col gap-1">
                Your email
                <Input name="email" type="email" required />
              </label>
              <label className="flex flex-col gap-1">
                Message
                <TextArea name="message" rows={5} required />
              </label>
              <div className="flex justify-end">
                <Button type="submit">Send</Button>
              </div>
            </div>
          )}
        </Fieldset>
      </form>
    </div>
  )
}
