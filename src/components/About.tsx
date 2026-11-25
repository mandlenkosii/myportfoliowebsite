import { profile } from '../config'
import { skills } from '../data/projects'
import Reveal from './Reveal'
import Section from './Section'

const principles = [
  { title: 'Fair by design', body: 'Rules live in the system, not in a manual. If a step would be unfair, the software says so and explains why.' },
  { title: 'Typed, tested, tracked', body: 'TypeScript, tests, CI and audit logs. The unglamorous parts that make software trustworthy.' },
  { title: 'Shipped, then polished', body: 'Get it live, get it in front of people, then make it feel delightful.' },
]

const journey = [
  { when: 'Jan 2026', what: 'Joined GitHub and started building in public.' },
  { when: 'May 2026', what: 'First deployed websites for local businesses.' },
  { when: 'Jul 2026', what: 'React, external APIs, auth and data dashboards.' },
  { when: 'Sep 2026', what: 'Full-stack systems with Node.js, Express and Jest.' },
  { when: 'Oct 2026', what: 'Melsoft programme: deep JavaScript fundamentals and OOP.' },
  { when: 'Nov 2026', what: 'AI agent systems and FairStep, with CI and role-based access.' },
]

function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items]
  return (
    <div className="group relative overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-2 group-hover:[animation-play-state:paused]">
        {row.map((s, i) => (
          <span key={i} className="whitespace-nowrap rounded-full border border-line bg-card px-3 py-1 text-sm text-muted" aria-hidden={i >= items.length}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function About() {
  return (
    <Section id="about" eyebrow="03 — About" title="Serious about the work. Not too serious about myself.">
      <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4 text-lg leading-relaxed">
          {profile.about.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className={i === 0 ? '' : 'text-muted'}>{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-line bg-card p-6">
            <p className="flex items-center gap-2 font-mono text-xs text-subtle">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" /> now
            </p>
            <p className="mt-3 leading-relaxed">{profile.now}</p>
          </div>
          <ol className="mt-6 space-y-3 border-l border-line pl-5">
            {journey.map((j) => (
              <li key={j.when} className="relative text-sm">
                <span className="absolute -left-[23.5px] top-1.5 size-2 rounded-full border border-line bg-bg" />
                <span className="font-mono text-xs text-subtle">{j.when}</span>
                <p className="text-muted">{j.what}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-3 md:grid-cols-3">
        {principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <div className="h-full rounded-3xl border border-line p-6">
              <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <p className="mb-3 font-mono text-xs text-subtle">toolkit</p>
        <Marquee items={skills.map((s) => s.name)} />
      </Reveal>
    </Section>
  )
}
