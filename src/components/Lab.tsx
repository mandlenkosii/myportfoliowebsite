import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Four corner brackets, like a camera / CAD selection frame. */
export function Brackets({ size = 10, color = 'rgba(148,163,184,0.7)', className = '' }: { size?: number; color?: string; className?: string }) {
  const s = { width: size, height: size, borderColor: color }
  return (
    <span className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <span className="absolute -left-px -top-px border-l border-t" style={s} />
      <span className="absolute -right-px -top-px border-r border-t" style={s} />
      <span className="absolute -bottom-px -left-px border-b border-l" style={s} />
      <span className="absolute -bottom-px -right-px border-b border-r" style={s} />
    </span>
  )
}

/** Section title block: index, label, ruler, heading. */
export function SectionHeader({ index, label, title, children }: { index: string; label: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-signal">§{index}</span>
        <span className="mono-label text-paper/80">{label}</span>
        <motion.div
          className="ruler flex-1 origin-left opacity-60"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className="hidden font-mono text-[10px] text-steel/60 sm:block">FIG.{index}</span>
      </div>
      <h2 className="mt-6 text-4xl font-semibold tracking-tight text-paper md:text-6xl">{title}</h2>
      {children}
    </div>
  )
}

/** Key/value row for spec tables. */
export function SpecRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-steel/15 py-2 text-sm last:border-0">
      <span className="font-mono text-[11px] uppercase tracking-widest text-steel/70">{k}</span>
      <span className="text-right text-paper/85">{v}</span>
    </div>
  )
}
