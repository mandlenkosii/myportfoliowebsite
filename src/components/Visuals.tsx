import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** FairStep: a disciplinary-process stepper that advances on its own. */
export function StepperVisual() {
  const steps = ['Incident', 'Investigation', 'Notice', 'Hearing', 'Outcome', 'Appeal']
  const [at, setAt] = useState(reduced ? 3 : 0)
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setAt((n) => (n + 1) % (steps.length + 1)), 1100)
    return () => clearInterval(id)
  }, [steps.length])

  return (
    <div className="flex items-start gap-1" aria-hidden>
      {steps.map((s, i) => {
        const done = i < at
        const current = i === at
        return (
          <div key={s} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span className={`h-px flex-1 ${i === 0 ? 'opacity-0' : done || current ? 'bg-accent' : 'bg-line'}`} />
              <motion.span
                animate={{ scale: current ? 1.25 : 1 }}
                className={`grid size-5 shrink-0 place-items-center rounded-full border text-[9px] font-medium transition-colors ${
                  done ? 'border-accent bg-accent text-white' : current ? 'border-accent text-accent' : 'border-line text-subtle'
                }`}
              >
                {done ? '✓' : i + 1}
              </motion.span>
              <span className={`h-px flex-1 ${i === steps.length - 1 ? 'opacity-0' : done ? 'bg-accent' : 'bg-line'}`} />
            </div>
            <span className={`hidden text-[10px] sm:block ${done || current ? 'text-fg' : 'text-subtle'}`}>{s}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Colleague Zero: seven agents in a ring, passing work around. */
export function AgentsVisual() {
  const agents = ['Planner', 'Marker', 'Reviewer', 'Diagnostician', 'Builder', 'Checker', 'Delivery']
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setAt((n) => (n + 1) % agents.length), 900)
    return () => clearInterval(id)
  }, [agents.length])

  const R = 54
  const pos = agents.map((_, i) => {
    const a = (i / agents.length) * Math.PI * 2 - Math.PI / 2
    return { x: 70 + Math.cos(a) * R, y: 70 + Math.sin(a) * R }
  })
  const next = (at + 1) % agents.length

  return (
    <div className="flex items-center gap-4" aria-hidden>
      <svg viewBox="0 0 140 140" className="size-32 shrink-0">
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--border)" strokeDasharray="3 4" />
        <circle cx="70" cy="70" r="12" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
        <text x="70" y="73" textAnchor="middle" fontSize="7" fill="var(--accent)" fontFamily="Geist Mono, monospace">
          GOAL
        </text>
        {!reduced && (
          <motion.circle
            key={at}
            r="2.5"
            fill="var(--accent)"
            initial={{ cx: pos[at].x, cy: pos[at].y }}
            animate={{ cx: pos[next].x, cy: pos[next].y }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )}
        {pos.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === at ? 7 : 5}
            fill={i === at ? 'var(--accent)' : 'var(--card)'}
            stroke={i === at ? 'var(--accent)' : 'var(--subtle)'}
            style={{ transition: 'all .3s' }}
          />
        ))}
      </svg>
      <div className="min-w-0 font-mono text-[11px] leading-5">
        <div className="text-subtle">active agent</div>
        <div className="truncate text-fg">{agents[at]}</div>
        <div className="mt-2 text-subtle">hand-off →</div>
        <div className="truncate text-muted">{agents[next]}</div>
      </div>
    </div>
  )
}
