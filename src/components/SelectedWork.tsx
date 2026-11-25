import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import { useCallback, useState, type MouseEvent, type ReactNode } from 'react'
import type { Project } from '../data/projects'
import { cn, scrollToId } from '../lib'
import ProjectSheet from './ProjectSheet'
import Reveal from './Reveal'
import Section from './Section'
import { AgentsVisual, StepperVisual } from './Visuals'
import { ArrowIcon, ExternalIcon } from './icons'

// Bento layout: which featured repo goes where, and which gets a live diagram.
const LAYOUT: { repo: string; span: string; visual?: ReactNode }[] = [
  { repo: 'fairstep', span: 'md:col-span-4', visual: <StepperVisual /> },
  { repo: 'The-Assess-to-Intervene-Colleague', span: 'md:col-span-2 md:row-span-2', visual: <AgentsVisual /> },
  { repo: 'claimguard-raf', span: 'md:col-span-2' },
  { repo: 'riverside-community-hub', span: 'md:col-span-2' },
  { repo: 'earth-dashboard', span: 'md:col-span-3' },
  { repo: 'seat-reservation-system', span: 'md:col-span-3' },
]

/** Card with a soft spotlight that follows the cursor. */
function SpotlightCard({ children, className, onClick, label }: { children: ReactNode; className?: string; onClick: () => void; label: string }) {
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const bg = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, var(--accent-soft), transparent 70%)`
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }
  return (
    <div
      onMouseMove={move}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
      role="button"
      tabIndex={0}
      aria-label={label}
      className={cn('group relative h-full cursor-pointer overflow-hidden rounded-3xl border border-line bg-card p-6 transition-[border-color,transform] duration-300 hover:border-accent/40 active:scale-[0.99]', className)}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  )
}

export default function SelectedWork({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<Project | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const byRepo = new Map(projects.map((p) => [p.repo, p]))
  const cards = LAYOUT.map((l) => ({ ...l, p: byRepo.get(l.repo) })).filter((c): c is typeof c & { p: Project } => !!c.p)

  return (
    <Section id="work" eyebrow="01 — Selected work" title="Things I've built that I'm proud of." intro="Six projects that show how I think: real problems, careful rules, and interfaces people can trust.">
      <div className="grid gap-3 md:auto-rows-[minmax(220px,auto)] md:grid-cols-6">
        {cards.map(({ p, span, visual }, i) => (
          <Reveal key={p.repo} delay={i * 0.05} className={span}>
            <SpotlightCard onClick={() => setOpen(p)} label={`Open ${p.title}`}>
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs text-subtle">
                  {String(i + 1).padStart(2, '0')} · {p.category}
                </span>
                {p.live && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:text-fg"
                  >
                    Live <ExternalIcon className="size-3" />
                  </a>
                )}
              </div>

              {p.metric && (
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{p.metric.value}</span>
                  <span className="text-sm text-subtle">{p.metric.label}</span>
                </div>
              )}

              {visual && <div className="mt-6">{visual}</div>}

              <div className="mt-auto pt-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  {p.title}
                  <ArrowIcon className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{p.tagline}</p>
                <p className="mt-3 font-mono text-[11px] text-subtle">{p.tech.slice(0, 4).join(' · ')}</p>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6 flex justify-center">
        <button onClick={() => scrollToId('projects')} className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
          Browse all {projects.length} projects
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </Reveal>

      <ProjectSheet project={open} onClose={close} />
    </Section>
  )
}
