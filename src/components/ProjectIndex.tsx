import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { profile } from '../config'
import type { Category, Project } from '../data/projects'
import { formatMonth } from '../lib'
import Section from './Section'
import { ChevronIcon, ExternalIcon, GitHubIcon } from './icons'

const TABS: ('All' | Category)[] = ['All', 'Full-Stack', 'Web Apps', 'Client Sites', 'JavaScript']
const PAGE = 10

function Row({ p, open, onToggle }: { p: Project; open: boolean; onToggle: () => void }) {
  return (
    <motion.li layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-line">
      <button onClick={onToggle} aria-expanded={open} className="group grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-4 text-left md:grid-cols-[5.5rem_1fr_14rem_auto]">
        <span className="font-mono text-xs text-subtle">{formatMonth(p.created)}</span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-medium transition-colors group-hover:text-accent">
            {p.title}
            {p.auto && <span className="rounded-full bg-accent-soft px-1.5 py-px text-[10px] text-accent">new</span>}
          </span>
          <span className="block truncate text-sm text-muted">{p.tagline}</span>
        </span>
        <span className="hidden truncate font-mono text-[11px] text-subtle md:block">{p.tech.slice(0, 3).join(' · ')}</span>
        <ChevronIcon className={`size-4 text-subtle transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* grid-rows trick animates height without measuring */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pb-6 md:pl-[6.5rem]">
            <p className="max-w-2xl text-sm leading-relaxed text-muted">{p.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-fg px-3.5 py-1.5 text-xs font-medium text-bg">
                  Live site <ExternalIcon className="size-3" />
                </a>
              )}
              <a
                href={`${profile.links.github}/${p.repo}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium hover:bg-card-hover"
              >
                <GitHubIcon className="size-3.5" /> Code
              </a>
              <span className="ml-1 text-xs text-subtle">{p.tech.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  )
}

export default function ProjectIndex({ projects }: { projects: Project[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const [open, setOpen] = useState<string | null>(null)
  const [all, setAll] = useState(false)

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t, t === 'All' ? projects.length : projects.filter((p) => p.category === t).length])), [projects])
  const list = useMemo(
    () => projects.filter((p) => tab === 'All' || p.category === tab).sort((a, b) => b.created.localeCompare(a.created)),
    [projects, tab],
  )
  const shown = all ? list : list.slice(0, PAGE)

  return (
    <Section id="projects" eyebrow="02 — Index" title="Every project, newest first." intro="Flagship builds, client sites and bootcamp exercises, synced live from my GitHub. Tap a row for details.">
      {/* sliding pill tabs */}
      <div role="tablist" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t)
              setOpen(null)
            }}
            className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${tab === t ? 'text-bg' : 'text-muted hover:text-fg'}`}
          >
            {tab === t && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative">
              {t} <span className="opacity-50">{counts[t]}</span>
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-4 border-t border-line">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((p) => (
            <Row key={p.repo} p={p} open={open === p.repo} onToggle={() => setOpen((o) => (o === p.repo ? null : p.repo))} />
          ))}
        </AnimatePresence>
      </ul>

      {list.length > PAGE && (
        <div className="mt-6 text-center">
          <button onClick={() => setAll((a) => !a)} className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:bg-card-hover hover:text-fg">
            {all ? 'Show less' : `Show ${list.length - PAGE} more`}
          </button>
        </div>
      )}
    </Section>
  )
}
