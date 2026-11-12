import { lazy, Suspense, useState } from 'react'
import { skills, skillGroupColors } from '../data/projects'
import { useInView } from '../hooks/useInView'
import { Brackets, SectionHeader } from './Lab'
import Reveal from './Reveal'

const SkillsSphere = lazy(() => import('../three/SkillsSphere'))

const groups = [
  { id: 'lang', label: 'Languages', code: 'L' },
  { id: 'front', label: 'Frontend', code: 'F' },
  { id: 'back', label: 'Backend & Data', code: 'B' },
  { id: 'tool', label: 'Tools & Practices', code: 'T' },
] as const

export default function Skills() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [active, setActive] = useState<string | null>(null)

  return (
    <section id="skills" className="relative px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeader index="03" label="Capability matrix" title={<>The <span className="text-steel-gradient">toolkit</span>, as a lattice.</>}>
            <p className="mt-5 max-w-2xl text-lg font-light text-paper/60">
              Each atom is a technology, bonded to its nearest neighbours. Select a group to isolate it in the model.
            </p>
          </SectionHeader>
        </Reveal>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_1.25fr]">
          <div className="panel">
            <Brackets size={10} />
            <div className="grid grid-cols-[auto_1fr_auto] border-b border-steel/15 px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] text-steel">
              <span className="w-8">ID</span>
              <span>GROUP / ELEMENTS</span>
              <span>QTY</span>
            </div>
            {groups.map((g, i) => {
              const items = skills.filter((s) => s.group === g.id)
              const color = skillGroupColors[g.id]
              const on = active === g.id
              return (
                <Reveal key={g.id} delay={i * 0.06}>
                  <div
                    onPointerEnter={() => setActive(g.id)}
                    onPointerLeave={() => setActive(null)}
                    onClick={() => setActive((a) => (a === g.id ? null : g.id))}
                    className={`grid cursor-default grid-cols-[auto_1fr_auto] gap-y-3 border-b border-steel/10 px-4 py-4 transition-colors last:border-0 ${on ? 'bg-signal/[0.07]' : ''}`}
                  >
                    <span className="w-8 font-mono text-xs" style={{ color }}>
                      {g.code}-0{i + 1}
                    </span>
                    <span className="flex items-center gap-2 text-sm font-medium text-paper">
                      <span className="size-1.5" style={{ background: color }} />
                      {g.label}
                    </span>
                    <span className="font-mono text-xs text-steel">{String(items.length).padStart(2, '0')}</span>
                    <div className="col-span-3 flex flex-wrap gap-1.5 pl-8">
                      {items.map((s) => (
                        <span
                          key={s.name}
                          className="border px-2 py-0.5 font-mono text-[11px] transition-colors"
                          style={{ borderColor: on ? `${color}88` : 'rgba(148,163,184,0.18)', color: on ? color : 'rgba(241,245,249,0.7)' }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <div ref={ref} className="relative h-[440px] md:h-[580px]">
            <div className="pointer-events-none absolute left-0 top-0 font-mono text-[10px] tracking-widest text-steel">
              FIG.03 · LATTICE MODEL
              <div className="mt-1 text-steel/60">ATOMS {skills.length} · {active ? `ISOLATED: ${active.toUpperCase()}` : 'ALL GROUPS'}</div>
            </div>
            <Suspense fallback={null}>
              <SkillsSphere inView={inView} activeGroup={active} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
