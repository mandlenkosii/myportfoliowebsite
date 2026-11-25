import { profile } from '../config'
import Reveal from './Reveal'
import Section from './Section'
import { DownloadIcon, ExternalIcon, FileIcon } from './icons'

// Summary of the CV, so visitors get the gist before opening the PDF.
const experience = [
  { role: 'Junior Software Engineer', org: 'MelSoft Academy · Rosebank (hybrid)', when: 'Oct 2026 – now' },
  { role: 'Software Engineering Intern', org: 'LexisNexis · Johannesburg', when: 'Jul – Sep 2023' },
  { role: 'Tutor & Advisor', org: 'Johannesburg', when: '2020 – 2022' },
]
const education = [
  { role: 'AI Software Developer Programme', org: 'MelSoft Academy', when: 'In progress' },
  { role: 'Computer Science', org: 'University of the Western Cape', when: 'From 2020' },
]

function Timeline({ title, items }: { title: string; items: typeof experience }) {
  return (
    <div>
      <p className="font-mono text-xs text-subtle">{title}</p>
      <ul className="mt-3 divide-y divide-[var(--border)] border-y border-line">
        {items.map((i) => (
          <li key={i.role} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="font-medium">{i.role}</p>
              <p className="truncate text-sm text-muted">{i.org}</p>
            </div>
            <span className="shrink-0 font-mono text-xs text-subtle sm:order-none">{i.when}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Resume() {
  const cv = profile.links.cv
  if (!cv) return null
  const fileName = cv.split('/').pop()

  return (
    <Section id="resume" eyebrow="05 — Résumé" title="The one-page version (well, two)." intro="Everything above, in a format recruiters love. Preview it here or download the PDF.">
      <div className="grid gap-10 md:grid-cols-[1fr_1.15fr]">
        <Reveal className="min-w-0 space-y-8">
          <Timeline title="experience" items={experience} />
          <Timeline title="education" items={education} />

          <div className="flex flex-wrap gap-2">
            <a
              href={cv}
              download={fileName}
              className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform active:scale-[0.97]"
            >
              <DownloadIcon className="size-4 transition-transform group-hover:translate-y-0.5" /> Download PDF
            </a>
            <a
              href={cv}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card-hover"
            >
              Open in new tab <ExternalIcon className="size-3.5" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0">
          {/* Desktop: inline preview. Mobile browsers render embedded PDFs poorly, so they get a tap-to-open card. */}
          <div className="hidden overflow-hidden rounded-3xl border border-line bg-card shadow-sm md:block">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="size-2.5 rounded-full bg-line" />
              <span className="ml-2 truncate font-mono text-[11px] text-subtle">{fileName}</span>
            </div>
            <object data={`${cv}#view=FitH&toolbar=0&navpanes=0`} type="application/pdf" className="block h-[640px] w-full bg-white" aria-label="Résumé preview">
              <div className="grid h-full place-items-center p-8 text-center text-sm text-muted">
                <p>
                  Your browser can't show PDFs inline.{' '}
                  <a href={cv} target="_blank" rel="noreferrer" className="text-accent underline">
                    Open the résumé
                  </a>
                  .
                </p>
              </div>
            </object>
          </div>

          <a
            href={cv}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-3xl border border-line bg-card p-5 transition-colors hover:bg-card-hover md:hidden"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
              <FileIcon className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{profile.name} — Résumé</span>
              <span className="block truncate font-mono text-xs text-subtle">{fileName} · 2 pages</span>
            </span>
            <ExternalIcon className="size-4 text-subtle" />
          </a>
        </Reveal>
      </div>
    </Section>
  )
}
