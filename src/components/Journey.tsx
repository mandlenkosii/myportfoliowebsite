import { motion, useScroll, useSpring } from 'motion/react'
import { useMemo, useRef } from 'react'
import { categoryColors, type Project } from '../data/projects'
import { SectionHeader } from './Lab'
import Reveal from './Reveal'

const milestones: Record<string, string> = {
  '2026-01': 'Joined GitHub. Journey initiated.',
  '2026-05': 'First deployed websites, built with HTML and CSS.',
  '2026-07': 'Moved into React, external APIs and authentication.',
  '2026-08': 'First Node.js / Express APIs and live-data dashboards.',
  '2026-09': 'Full-stack systems with testing, rate limits and waitlists.',
  '2026-10': 'Melsoft bootcamp: deep JavaScript fundamentals and OOP.',
  '2026-11': 'Production client sites and role-based platforms.',
}

export default function Journey({ projects, joined }: { projects: Project[]; joined?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 })

  const months = useMemo(() => {
    const map = new Map<string, Project[]>()
    projects.forEach((p) => {
      const k = p.created.slice(0, 7)
      map.set(k, [...(map.get(k) ?? []), p])
    })
    const joinKey = (joined ?? '2026-01-26').slice(0, 7)
    if (!map.has(joinKey)) map.set(joinKey, [])
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [projects, joined])

  return (
    <section id="journey" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader index="04" label="Lab log" title={<>Progress, <span className="text-steel-gradient">recorded monthly</span>.</>}>
            <p className="mt-5 max-w-2xl text-lg font-light text-paper/60">A chronological record generated from the creation dates of my repositories.</p>
          </SectionHeader>
        </Reveal>

        <div ref={ref} className="relative mt-16">
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-steel/15 md:left-[183px]" />
          <motion.div className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-signal md:left-[183px]" style={{ scaleY }} />

          <div className="space-y-4">
            {months.map(([month, list], i) => {
              const date = new Date(month + '-01T00:00:00')
              const entry = String(months.length - i).padStart(3, '0')
              return (
                <div key={month} className="relative grid gap-3 pl-8 md:grid-cols-[160px_1fr] md:gap-12 md:pl-0">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="absolute left-0 top-5 z-10 size-[15px] border border-signal bg-ink md:left-[176px]"
                  >
                    <span className="absolute inset-[4px] bg-signal" />
                  </motion.span>

                  <Reveal className="md:pt-4 md:text-right">
                    <div className="font-mono text-sm text-paper">{date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }).toUpperCase()}</div>
                    <div className="font-mono text-[10px] tracking-widest text-steel/60">ENTRY {entry}</div>
                  </Reveal>

                  <Reveal delay={0.08}>
                    <div className="panel panel-hover p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-paper/90">{milestones[month] ?? 'Development continued.'}</p>
                        <span className="font-mono text-[10px] tracking-widest text-steel">
                          {String(list.length).padStart(2, '0')} {list.length === 1 ? 'REPO' : 'REPOS'}
                        </span>
                      </div>
                      {list.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {list.map((p) => (
                            <span key={p.repo} className="flex items-center gap-2 border border-steel/15 px-2.5 py-1 font-mono text-[11px] text-paper/75">
                              <span className="size-1.5" style={{ background: categoryColors[p.category] }} />
                              {p.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Reveal>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
