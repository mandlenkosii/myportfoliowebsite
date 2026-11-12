import { animate, motion, useInView } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '../config'
import { languageColors, type Project } from '../data/projects'
import type { GitHubData } from '../hooks/useGitHub'
import { formatMonth } from '../lib'
import { Brackets, SectionHeader, SpecRow } from './Lab'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import { GitHubIcon } from './icons'
import IdSchematic from './IdSchematic'

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  return (
    <span ref={ref} className="tabular-nums">
      {String(n).padStart(2, '0')}
      {suffix}
    </span>
  )
}

function languageBreakdown(projects: Project[]) {
  const counts: Record<string, number> = {}
  projects.forEach((p) => (counts[p.language] = (counts[p.language] || 0) + 1))
  const total = projects.length || 1
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, c]) => ({ lang, pct: (c / total) * 100, count: c }))
}

export default function About({ data }: { data: GitHubData }) {
  const { projects, user } = data
  const langs = useMemo(() => languageBreakdown(projects), [projects])
  const deployed = projects.filter((p) => p.live).length
  const techCount = new Set(projects.flatMap((p) => p.tech)).size
  const since = user?.created_at?.slice(0, 10) ?? '2026-01-26'
  const repoCount = user?.public_repos ?? projects.length

  const stats = [
    { k: 'PUBLIC REPOS', value: repoCount, max: Math.max(repoCount, 30) },
    { k: 'LIVE DEPLOYMENTS', value: deployed, max: repoCount },
    { k: 'TECHNOLOGIES', value: techCount, max: Math.max(techCount, 40), suffix: '+' },
    { k: 'FEATURED BUILDS', value: projects.filter((p) => p.featured).length, max: repoCount },
  ]

  return (
    <section id="about" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader index="01" label="Subject profile" title={<>Engineering software for <span className="text-steel-gradient">real-world systems</span>.</>} />
        </Reveal>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <TiltCard className="panel p-3" intensity={6}>
              <Brackets size={12} color="#4f86f7" />
              <div className="relative overflow-hidden" style={{ transform: 'translateZ(30px)' }}>
                <div className="scan relative">
                  {profile.photo ? (
                    <>
                      <img src={profile.photo} alt={profile.name} className="aspect-square w-full object-cover grayscale contrast-110" loading="lazy" />
                      <div className="absolute inset-0 bg-navy-700 mix-blend-color" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                    </>
                  ) : (
                    <IdSchematic />
                  )}
                  {/* measurement overlay */}
                  <div className="absolute inset-6 border border-dashed border-paper/20" />
                  <div className="absolute left-1/2 top-6 h-[calc(100%-3rem)] w-px bg-paper/10" />
                  <div className="absolute left-6 top-1/2 h-px w-[calc(100%-3rem)] bg-paper/10" />
                  <div className="absolute left-8 top-8 font-mono text-[10px] tracking-widest text-paper/60">IMG-001 · SUBJECT</div>
                  <div className="absolute right-8 top-8 font-mono text-[10px] tracking-widest text-signal">● REC</div>
                </div>
              </div>
              <div className="mt-3 px-2 pb-1" style={{ transform: 'translateZ(20px)' }}>
                <SpecRow k="Name" v={profile.name} />
                <SpecRow k="Role" v={profile.role} />
                <SpecRow k="Location" v={profile.location} />
                <SpecRow k="On GitHub" v={`Since ${formatMonth(since)}`} />
                <SpecRow
                  k="Handle"
                  v={
                    <a href={profile.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-ice hover:text-paper">
                      <GitHubIcon className="size-3.5" /> {profile.githubUser}
                    </a>
                  }
                />
              </div>
            </TiltCard>
          </Reveal>

          <div>
            {profile.about.map((p, i) => (
              <Reveal key={i} delay={0.05 + i * 0.08}>
                <p className={`text-lg font-light leading-relaxed ${i === 0 ? 'text-paper/90 md:text-xl' : 'mt-5 text-paper/65'}`}>{p}</p>
              </Reveal>
            ))}

            <div className="mt-10 grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <Reveal key={s.k} delay={0.1 + i * 0.06}>
                  <div className="panel panel-hover p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] tracking-[0.2em] text-steel">{s.k}</span>
                      <span className="font-mono text-[9px] text-steel/40">M-0{i + 1}</span>
                    </div>
                    <div className="mt-3 font-mono text-4xl font-medium text-paper md:text-5xl">
                      <Counter value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="mt-4 h-1 w-full bg-steel/10">
                      <motion.div
                        className="h-full bg-signal"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(100, (s.value / s.max) * 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <div className="panel mt-3 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-steel">COMPOSITION ANALYSIS · PRIMARY LANGUAGE</span>
                  {data.live && <span className="font-mono text-[9px] tracking-widest text-ice">● LIVE · GITHUB API</span>}
                </div>
                <div className="flex h-2.5 gap-px">
                  {langs.map((l, i) => (
                    <motion.div
                      key={l.lang}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${l.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: languageColors[l.lang] ?? languageColors.Other }}
                      title={`${l.lang}: ${l.count}`}
                    />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                  {langs.map((l) => (
                    <span key={l.lang} className="flex items-center gap-2 font-mono text-xs text-paper/75">
                      <span className="size-2" style={{ background: languageColors[l.lang] ?? languageColors.Other }} />
                      {l.lang}
                      <span className="ml-auto text-steel/60">{l.pct.toFixed(1)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
