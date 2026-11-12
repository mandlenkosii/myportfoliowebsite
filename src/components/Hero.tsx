import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { profile } from '../config'
import type { Project } from '../data/projects'
import { scrollToId } from '../lib'
import { ArrowIcon, GitHubIcon, LinkedInIcon } from './icons'
import { Brackets } from './Lab'

function Typewriter({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[i % words.length]
    const done = !deleting && text === word
    const empty = deleting && text === ''
    const delay = done ? 1700 : empty ? 300 : deleting ? 30 : 65
    const t = setTimeout(() => {
      if (done) setDeleting(true)
      else if (empty) {
        setDeleting(false)
        setI((n) => n + 1)
      } else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1))
    }, delay)
    return () => clearTimeout(t)
  }, [text, deleting, i, words])

  return (
    <span className="font-mono text-ice">
      {text}
      <span className="ml-0.5 inline-block w-[0.55ch] animate-[blink_1s_steps(1)_infinite] bg-ice">&nbsp;</span>
    </span>
  )
}

const letter = {
  hidden: { y: '105%', opacity: 0 },
  show: (i: number) => ({ y: '0%', opacity: 1, transition: { delay: 0.15 + i * 0.035, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }),
}

export default function Hero({ ready, projects }: { ready: boolean; projects: Project[] }) {
  const [first, ...rest] = profile.name.split(' ')
  const lines = [first, rest.join(' ')]
  let idx = 0

  const readouts = [
    { k: 'REPOSITORIES', v: projects.length },
    { k: 'DEPLOYED', v: projects.filter((p) => p.live).length },
    { k: 'PRIMARY STACK', v: 'TS · REACT · NODE' },
    { k: 'BASE', v: 'JOHANNESBURG' },
  ]

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center px-5 md:px-10">
      <div className="mx-auto w-full max-w-6xl pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-widest text-steel"
        >
          <span className="flex items-center gap-2 border border-steel/25 px-2.5 py-1 text-paper/80">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping bg-signal opacity-75" />
              <span className="relative inline-flex size-1.5 bg-signal" />
            </span>
            AVAILABLE FOR WORK
          </span>
          <span>REF. MS-2026</span>
          <span className="hidden sm:inline">DOC. PORTFOLIO / REV 2.0</span>
        </motion.div>

        <h1 className="text-[clamp(3.2rem,10.5vw,8.5rem)] font-semibold leading-[0.92] tracking-[-0.035em]" aria-label={profile.name}>
          {lines.map((line, li) => (
            <span key={li} className={`block overflow-hidden pb-1 ${li === 1 ? 'text-steel-gradient' : 'text-paper'}`} aria-hidden>
              {line.split('').map((ch) => {
                const n = idx++
                return (
                  <motion.span key={n} custom={n} variants={letter} initial="hidden" animate={ready ? 'show' : 'hidden'} className="inline-block">
                    {ch === ' ' ? ' ' : ch}
                  </motion.span>
                )
              })}
            </span>
          ))}
        </h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 0.8 }}>
          <p className="mt-6 font-mono text-base text-steel md:text-lg">
            <span className="text-signal">&gt;</span> {profile.role.toLowerCase()} :: <Typewriter words={profile.roles} />
          </p>
          <p className="mt-4 max-w-xl text-lg font-light leading-relaxed text-paper/70 md:text-xl">{profile.tagline}</p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToId('projects')}
              className="group relative flex items-center gap-3 overflow-hidden bg-paper px-6 py-3.5 text-sm font-semibold text-ink transition-colors"
            >
              <span className="absolute inset-0 -translate-x-full bg-signal transition-transform duration-500 group-hover:translate-x-0" />
              <span className="relative transition-colors group-hover:text-paper">View projects</span>
              <ArrowIcon className="relative size-4 transition-all group-hover:translate-x-1 group-hover:text-paper" />
            </button>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="relative flex items-center gap-2 border border-steel/30 px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:border-signal"
            >
              <GitHubIcon className="size-4" /> @{profile.githubUser}
            </a>
            {profile.links.linkedin && (
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-steel/30 px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:border-signal"
              >
                <LinkedInIcon className="size-4" /> LinkedIn
              </a>
            )}
          </div>

          <div className="panel mt-12 grid max-w-3xl grid-cols-2 md:grid-cols-4">
            <Brackets size={8} />
            {readouts.map((r, i) => (
              <div key={r.k} className={`px-4 py-3 ${i > 0 ? 'md:border-l' : ''} ${i % 2 === 1 ? 'border-l' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''} border-steel/15`}>
                <div className="font-mono text-[9px] tracking-[0.2em] text-steel/70">{r.k}</div>
                <div className="mt-1 font-mono text-sm text-paper">{r.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </section>
  )
}
