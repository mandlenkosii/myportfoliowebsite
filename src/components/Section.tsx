import type { ReactNode } from 'react'
import Reveal from './Reveal'

export default function Section({ id, eyebrow, title, intro, children }: {
  id: string
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6 py-20 md:py-28">
      <Reveal>
        <p className="font-mono text-xs text-subtle">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{title}</h2>
        {intro && <p className="mt-3 max-w-xl leading-relaxed text-muted">{intro}</p>}
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  )
}
