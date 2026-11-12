import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { profile } from '../config'
import { Brackets } from './Lab'
import Reveal from './Reveal'
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons'

function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.25)
        y.set((e.clientY - r.top - r.height / 2) * 0.25)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const channels = [
    profile.email && { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: <MailIcon className="size-4" />, primary: true },
    { label: 'GitHub', value: `github.com/${profile.githubUser}`, href: profile.links.github, icon: <GitHubIcon className="size-4" /> },
    profile.links.linkedin && { label: 'LinkedIn', value: 'in/mandla-sikhosana', href: profile.links.linkedin, icon: <LinkedInIcon className="size-4" /> },
    profile.links.cv && { label: 'Résumé', value: 'Download CV', href: profile.links.cv, icon: null },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: ReactNode; primary?: boolean }[]

  return (
    <section id="contact" className="relative px-5 pb-12 pt-28 md:px-10 md:pt-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="panel overflow-hidden">
            <Brackets size={16} color="#4f86f7" />
            <div className="flex items-center justify-between border-b border-steel/15 px-5 py-3 font-mono text-[10px] tracking-[0.2em] text-steel md:px-10">
              <span>§05 · OPEN CHANNEL</span>
              <span className="flex items-center gap-2 text-ice">
                <span className="size-1.5 animate-pulse bg-signal" /> RECEIVING
              </span>
            </div>

            <div className="grid gap-12 px-5 py-14 md:px-10 md:py-20 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <h2 className="text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-paper md:text-7xl">
                  Let&apos;s engineer <span className="text-steel-gradient">something</span> together.
                </h2>
                <p className="mt-6 max-w-lg text-lg font-light text-paper/60">
                  I&apos;m open to junior developer roles, internships, freelance websites and collaborations. Expect a reply within 24 hours.
                </p>
                <div className="mt-8 font-mono text-sm text-steel">
                  <span className="text-signal">$</span> contact --to &quot;{profile.firstName.toLowerCase()}&quot; --priority high
                  <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-[blink_1s_steps(1)_infinite] bg-ice" />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {channels.map((c, i) => (
                  <Magnetic key={c.label}>
                    <a
                      href={c.href}
                      target={c.href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noreferrer"
                      className={`group flex items-center gap-4 border px-5 py-4 transition-colors ${
                        c.primary ? 'border-paper bg-paper text-ink hover:bg-ice' : 'border-steel/25 text-paper hover:border-signal hover:bg-signal/10'
                      }`}
                    >
                      <span className={`font-mono text-[10px] ${c.primary ? 'text-ink/50' : 'text-steel/60'}`}>CH-0{i + 1}</span>
                      {c.icon}
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{c.label}</span>
                        <span className={`block truncate font-mono text-[11px] ${c.primary ? 'text-ink/60' : 'text-steel'}`}>{c.value}</span>
                      </span>
                      <span className="font-mono transition-transform group-hover:translate-x-1">→</span>
                    </a>
                  </Magnetic>
                ))}
                {profile.email && (
                  <button onClick={copy} className="mt-1 py-2 text-left font-mono text-[11px] tracking-wider text-steel transition-colors hover:text-paper">
                    {copied ? '[ ✓ ] ADDRESS COPIED TO CLIPBOARD' : '[ ⧉ ] COPY EMAIL ADDRESS'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-steel/10 pt-8 font-mono text-[11px] tracking-wider text-steel/60 md:flex-row">
          <span>
            © {new Date().getFullYear()} {profile.name.toUpperCase()} · {profile.location.toUpperCase()}
          </span>
          <span>BUILT WITH REACT · THREE.JS · REACT THREE FIBER</span>
        </footer>
      </div>
    </section>
  )
}
