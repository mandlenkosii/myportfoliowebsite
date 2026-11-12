import { motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { profile } from '../config'
import { scrollToId } from '../lib'
import { GitHubIcon, LinkedInIcon } from './icons'

const links = [
  { id: 'about', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Capabilities' },
  { id: 'journey', label: 'Log' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: '-45% 0px -50% 0px',
    })
    ;['home', ...links.map((l) => l.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div className="h-px origin-left bg-signal" style={{ scaleX }} />
      <nav
        className={`mx-3 mt-3 flex max-w-6xl items-center justify-between px-4 py-2.5 transition-all duration-500 md:px-5 lg:mx-auto ${
          scrolled ? 'panel' : 'border border-transparent'
        }`}
      >
        <button onClick={() => go('home')} className="group flex items-center gap-3" aria-label="Back to top">
          <span className="relative grid size-9 place-items-center border border-steel/40 font-mono text-sm font-semibold text-paper transition-colors group-hover:border-signal">
            MS
            <span className="absolute -right-1 -top-1 size-1.5 bg-signal" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-paper">{profile.name}</span>
            <span className="block font-mono text-[10px] tracking-widest text-steel">SOFTWARE ENGINEER</span>
          </span>
        </button>

        <ul className="hidden items-center md:flex">
          {links.map((l, i) => (
            <li key={l.id}>
              <button
                onClick={() => go(l.id)}
                className={`relative px-3.5 py-2 text-sm transition-colors ${active === l.id ? 'text-paper' : 'text-steel hover:text-paper'}`}
              >
                <span className="mr-1.5 font-mono text-[10px] text-steel/50">0{i + 1}</span>
                {l.label}
                {active === l.id && (
                  <motion.span layoutId="nav-line" className="absolute inset-x-3 -bottom-px h-px bg-signal" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {profile.links.linkedin && (
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hidden size-9 place-items-center border border-steel/25 text-steel transition-colors hover:border-signal hover:text-paper sm:grid"
            >
              <LinkedInIcon className="size-4" />
            </a>
          )}
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center gap-2 border border-steel/25 px-3.5 font-mono text-xs text-steel transition-colors hover:border-signal hover:text-paper sm:flex"
          >
            <GitHubIcon className="size-4" /> GITHUB
          </a>
          <button onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center md:hidden" aria-label="Menu" aria-expanded={open}>
            <div className="space-y-1.5">
              <span className={`block h-px w-6 bg-paper transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block h-px w-6 bg-paper transition-opacity ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-6 bg-paper transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {open && (
        <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="panel mx-3 mt-2 p-2 md:hidden">
          {links.map((l, i) => (
            <li key={l.id}>
              <button onClick={() => go(l.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-paper/80 hover:bg-white/5">
                <span className="font-mono text-[10px] text-steel/60">0{i + 1}</span>
                {l.label}
              </button>
            </li>
          ))}
          <li className="mt-1 flex gap-2 border-t border-steel/15 px-2 pt-3">
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 border border-steel/25 py-2.5 font-mono text-xs text-paper">
              <GitHubIcon className="size-4" /> GITHUB
            </a>
            {profile.links.linkedin && (
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 border border-steel/25 py-2.5 font-mono text-xs text-paper">
                <LinkedInIcon className="size-4" /> LINKEDIN
              </a>
            )}
          </li>
        </motion.ul>
      )}
    </header>
  )
}
