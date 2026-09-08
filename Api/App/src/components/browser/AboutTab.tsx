import { site } from '../../content/site'

export function AboutTab() {
  return (
    <article className="max-w-[60ch]">
      <h1 className="mb-2 text-[14px] font-bold">{site.owner}</h1>
      <p className="mb-3 italic">{site.tagline}</p>
      {site.about.map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className="mb-2">
          {paragraph}
        </p>
      ))}
      <p className="mt-4 text-[10px] opacity-70">Draft copy. Kyle to replace before launch.</p>
    </article>
  )
}
