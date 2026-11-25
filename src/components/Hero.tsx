import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react'
import { profile } from '../config'
import type { Project } from '../data/projects'
import { useInView } from '../hooks/useInView'
import { scrollToId } from '../lib'
import NumberTicker from './NumberTicker'
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon } from './icons'

const Orb = lazy(() => import('../three/Orb'))

function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2400)
    return () => clearInterval(id)
  }, [words.length])
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {/* invisible longest word reserves the width */}
      <span className="invisible col-start-1 row-start-1">{words.reduce((a, b) => (b.length > a.length ? b : a))}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="col-start-1 row-start-1 text-accent"
          initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export default function Hero({ projects, dark }: { projects: Project[]; dark: boolean }) {
  const [orbRef, orbInView] = useInView<HTMLDivElement>('0px')
  const live = projects.filter((p) => p.live).length

  return (
    <section id="home" className="relative grid min-h-[92svh] items-center gap-6 pt-20 md:grid-cols-[1.15fr_1fr] md:pt-0">
      <div className="order-2 md:order-1">
        <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs text-muted">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Available for work · Johannesburg
        </motion.div>

        <motion.h1 {...fade(0.08)} className="mt-6 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
          {profile.name.split(' ')[0]}
          <br />
          <span className="text-muted">{profile.name.split(' ').slice(1).join(' ')}</span>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mt-6 text-xl tracking-tight md:text-2xl">
          I build software for <RotatingWord words={profile.audiences} />.
        </motion.p>
        <motion.p {...fade(0.22)} className="mt-3 max-w-md leading-relaxed text-muted">
          {profile.tagline}
        </motion.p>

        <motion.div {...fade(0.3)} className="mt-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => scrollToId('work')}
            className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform active:scale-[0.97]"
          >
            See my work
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          {[
            { href: profile.links.github, label: 'GitHub', icon: <GitHubIcon className="size-4" /> },
            { href: profile.links.linkedin, label: 'LinkedIn', icon: <LinkedInIcon className="size-4" /> },
            profile.email && { href: `mailto:${profile.email}`, label: 'Email', icon: <MailIcon className="size-4" /> },
          ]
            .filter((l): l is { href: string; label: string; icon: ReactElement } => !!l && !!l.href)
            .map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                aria-label={l.label}
                title={l.label}
                className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-card-hover hover:text-fg"
              >
                {l.icon}
              </a>
            ))}
        </motion.div>

        <motion.dl {...fade(0.38)} className="mt-12 flex gap-8 text-sm">
          {[
            { k: 'public repos', v: projects.length },
            { k: 'live deployments', v: live },
            { k: 'flagship builds', v: projects.filter((p) => p.featured).length },
          ].map((s) => (
            <div key={s.k}>
              <dt className="sr-only">{s.k}</dt>
              <dd className="text-2xl font-semibold tracking-tight">
                <NumberTicker value={s.v} />
              </dd>
              <dd className="text-subtle">{s.k}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <motion.div
        ref={orbRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative order-1 mx-auto aspect-square w-full max-w-[280px] md:order-2 md:max-w-[460px]"
      >
        <Suspense fallback={null}>
          <Orb dark={dark} active={orbInView} />
        </Suspense>
        <p className="pointer-events-none absolute inset-x-0 -bottom-2 text-center font-mono text-[11px] text-subtle">
          <span className="hidden md:inline">drag to spin · </span>click to scatter
        </p>
      </motion.div>
    </section>
  )
}
