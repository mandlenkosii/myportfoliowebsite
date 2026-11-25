import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { profile } from '../config'
import Reveal from './Reveal'
import { ArrowIcon, CopyIcon, GitHubIcon, LinkedInIcon } from './icons'

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 font-mono text-sm text-muted transition-colors hover:bg-card-hover hover:text-fg"
      aria-label="Copy email address"
    >
      <span>{profile.email}</span>
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.svg key="ok" viewBox="0 0 24 24" className="size-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <motion.path d="m5 12 5 5L20 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
            </motion.svg>
          ) : (
            <motion.span key="copy" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
              <CopyIcon className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-6 pt-8 md:pt-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-card px-6 py-14 text-center md:px-12 md:py-20">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <p className="relative font-mono text-xs text-subtle">04 — Contact</p>
          <h2 className="relative mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Got a problem worth solving?</h2>
          <p className="relative mx-auto mt-4 max-w-md text-muted">
            I'm open to junior developer roles, internships and freelance builds. I usually reply within a day.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform active:scale-[0.97]">
                Say hello <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            )}
            {profile.email && <CopyEmail />}
          </div>

          <div className="relative mt-6 flex justify-center gap-2">
            <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-card-hover hover:text-fg">
              <GitHubIcon className="size-4" />
            </a>
            {profile.links.linkedin && (
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-card-hover hover:text-fg">
                <LinkedInIcon className="size-4" />
              </a>
            )}
            {profile.links.cv && (
              <a href="#resume" className="inline-flex items-center rounded-full px-3 text-sm text-muted hover:bg-card-hover hover:text-fg">
                Résumé ↓
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
