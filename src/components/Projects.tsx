import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { profile } from '../config'
import { categoryColors, languageColors, type Category, type Project } from '../data/projects'
import { useInView } from '../hooks/useInView'
import { formatMonth } from '../lib'
import { Brackets, SectionHeader } from './Lab'
import ProjectModal from './ProjectModal'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import { ArrowIcon, ExternalIcon, GitHubIcon, SearchIcon } from './icons'

const ProjectGalaxy = lazy(() => import('../three/ProjectGalaxy'))
const FILTERS: ('All' | 'Featured' | Category)[] = ['All', 'Featured', 'Full-Stack', 'Web Apps', 'Client Sites', 'JavaScript']

function ProjectCard({ p, code, onOpen }: { p: Project; code: string; onOpen: () => void }) {
  const color = categoryColors[p.category]
  return (
    <TiltCard className="panel panel-hover flex flex-col" intensity={5}>
      <Brackets size={8} color="rgba(148,163,184,0.45)" />
      {/* header strip */}
      <div className="flex items-center justify-between border-b border-steel/15 px-5 py-2.5 font-mono text-[10px] tracking-widest" style={{ transform: 'translateZ(20px)' }}>
        <span className="text-steel">{code}</span>
        <span className="flex items-center gap-2" style={{ color }}>
          <span className="size-1.5" style={{ background: color }} />
          {p.category.toUpperCase()}
        </span>
      </div>

      <button onClick={onOpen} className="flex-1 px-5 pt-5 text-left" style={{ transform: 'translateZ(35px)' }}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-paper">{p.title}</h3>
          {p.featured && <span className="shrink-0 border border-signal/50 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-ice">PRIORITY</span>}
          {p.auto && <span className="shrink-0 border border-ice/50 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-ice">NEW</span>}
        </div>
        <p className="mt-1 text-sm text-ice/80">{p.tagline}</p>
        <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-paper/60">{p.description}</p>
      </button>

      <div className="mt-5 px-5 font-mono text-[11px]" style={{ transform: 'translateZ(20px)' }}>
        <div className="flex justify-between border-t border-dashed border-steel/15 py-1.5">
          <span className="text-steel/60">STACK</span>
          <span className="truncate pl-4 text-paper/75">{p.tech.slice(0, 3).join(' · ')}</span>
        </div>
        <div className="flex justify-between border-t border-dashed border-steel/15 py-1.5">
          <span className="text-steel/60">LANG</span>
          <span className="flex items-center gap-1.5 text-paper/75">
            <span className="size-1.5" style={{ background: languageColors[p.language] ?? languageColors.Other }} />
            {p.language}
          </span>
        </div>
        <div className="flex justify-between border-t border-dashed border-steel/15 py-1.5">
          <span className="text-steel/60">INIT</span>
          <span className="text-paper/75">{formatMonth(p.created)}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center border-t border-steel/15" style={{ transform: 'translateZ(15px)' }}>
        <a
          href={`${profile.links.github}/${p.repo}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 py-3 font-mono text-[11px] tracking-wider text-steel transition-colors hover:bg-white/[0.03] hover:text-paper"
        >
          <GitHubIcon className="size-3.5" /> SOURCE
        </a>
        {p.live && (
          <a
            href={p.live}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 border-l border-steel/15 py-3 font-mono text-[11px] tracking-wider text-steel transition-colors hover:bg-white/[0.03] hover:text-paper"
          >
            <ExternalIcon className="size-3.5" /> LIVE
          </a>
        )}
        <button
          onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-2 border-l border-steel/15 py-3 font-mono text-[11px] tracking-wider text-ice transition-colors hover:bg-signal/10"
          aria-label={`Inspect ${p.title}`}
        >
          INSPECT <ArrowIcon className="size-3.5" />
        </button>
      </div>
    </TiltCard>
  )
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [galaxyRef, galaxyInView] = useInView<HTMLDivElement>()

  // Stable reference codes in order of creation: PRJ-001 is the oldest repo.
  const codes = useMemo(() => {
    const m = new Map<string, string>()
    ;[...projects].sort((a, b) => a.created.localeCompare(b.created)).forEach((p, i) => m.set(p.repo, `PRJ-${String(i + 1).padStart(3, '0')}`))
    return m
  }, [projects])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects
      .filter((p) => (filter === 'All' ? true : filter === 'Featured' ? p.featured : p.category === filter))
      .filter((p) => !q || [p.title, p.tagline, p.description, p.repo, ...p.tech].join(' ').toLowerCase().includes(q))
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.created.localeCompare(a.created))
  }, [projects, filter, query])

  const visible = showAll || query ? filtered : filtered.slice(0, 9)

  return (
    <section id="projects" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader index="02" label="Experiment index" title={<>{projects.length} systems, <span className="text-steel-gradient">built and shipped</span>.</>}>
            <p className="mt-5 max-w-2xl text-lg font-light text-paper/60">
              Each node in the orbital model below is a repository from my GitHub, grouped by discipline.{' '}
              <span className="hidden md:inline">Drag to rotate, hover to identify, click to inspect.</span>
              <span className="md:hidden">Tap a node to inspect it.</span>
            </p>
          </SectionHeader>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative flex items-center gap-2 border px-3.5 py-2 font-mono text-[11px] tracking-wider transition-colors ${
                filter === f ? 'border-paper bg-paper text-ink' : 'border-steel/25 text-steel hover:border-steel/60 hover:text-paper'
              }`}
            >
              {f !== 'All' && f !== 'Featured' && <span className="size-1.5" style={{ background: categoryColors[f] }} />}
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <Reveal>
          <div ref={galaxyRef} className="panel relative mt-4 h-[460px] overflow-hidden md:h-[620px]" data-cursor>
            <Brackets size={14} color="#4f86f7" />
            <Suspense fallback={<div className="grid h-full place-items-center font-mono text-xs text-steel">LOADING ORBITAL MODEL…</div>}>
              <ProjectGalaxy projects={projects} active={filter} onSelect={setSelected} inView={galaxyInView} />
            </Suspense>
            {/* HUD overlays */}
            <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] tracking-widest text-steel md:left-6 md:top-5">
              <div className="text-paper/80">ORBITAL MODEL · FIG.02</div>
              <div className="mt-1">N = {projects.length} · VIEW: {filter.toUpperCase()}</div>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 hidden text-right font-mono text-[10px] tracking-widest text-steel md:right-6 md:top-5 md:block">
              <div>SCALE 1 : 1 REPO</div>
              <div className="mt-1 text-ice">● TRACKING</div>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1.5 font-mono text-[10px] tracking-wider md:bottom-5 md:left-6">
              {(Object.keys(categoryColors) as Category[]).map((c, i) => (
                <span key={c} className="flex items-center gap-2 text-steel">
                  <span className="text-steel/40">R{i + 1}</span>
                  <span className="size-1.5" style={{ background: categoryColors[c] }} /> {c.toUpperCase()}
                </span>
              ))}
              <span className="mt-1 text-steel/50">RINGED NODE = PRIORITY BUILD</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-steel">TABLE 02.1 · SPECIFICATION SHEETS</div>
            <h3 className="mt-2 text-2xl font-semibold text-paper">
              {filter === 'All' ? 'All projects' : filter} <span className="font-mono text-lg text-steel/60">[{filtered.length}]</span>
            </h3>
          </div>
          <label className="flex w-full items-center gap-2 border border-steel/25 bg-navy-950/60 px-3.5 py-2.5 transition-colors focus-within:border-signal sm:w-72">
            <SearchIcon className="size-4 text-steel" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="query projects / tech…"
              className="w-full bg-transparent font-mono text-xs text-paper outline-none placeholder:text-steel/50"
            />
          </label>
        </div>

        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.div
                key={p.repo}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard p={p} code={codes.get(p.repo) ?? 'PRJ-000'} onOpen={() => setSelected(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && <p className="mt-10 text-center font-mono text-sm text-steel">NO RESULTS FOR “{query}”</p>}

        {!query && filtered.length > 9 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="border border-steel/30 px-6 py-3 font-mono text-xs tracking-wider text-paper transition-colors hover:border-signal hover:bg-signal/10"
            >
              {showAll ? '[ − ] COLLAPSE' : `[ + ] SHOW ALL ${filtered.length} RECORDS`}
            </button>
          </div>
        )}
      </div>

      <ProjectModal project={selected} code={selected ? codes.get(selected.repo) ?? '' : ''} onClose={() => setSelected(null)} />
    </section>
  )
}
