import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { profile } from '../config'
import { useTheme } from '../hooks/useTheme'
import { scrollToId } from '../lib'
import { GitHubIcon, GridIcon, HomeIcon, LinkedInIcon, ListIcon, MailIcon, MoonIcon, SunIcon, UserIcon } from './icons'

type Item = { label: string; icon: ReactNode; onClick?: () => void; href?: string; section?: string }

const fine = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

function DockIcon({ item, mouseX, active }: { item: Item; mouseX: MotionValue<number>; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)

  // Magnify based on horizontal distance from the cursor (desktop only).
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return x - b.x - b.width / 2
  })
  const size = useSpring(useTransform(distance, [-120, 0, 120], [40, fine ? 58 : 40, 40]), { mass: 0.1, stiffness: 160, damping: 13 })
  const iconSize = useSpring(useTransform(distance, [-120, 0, 120], [18, fine ? 24 : 18, 18]), { mass: 0.1, stiffness: 160, damping: 13 })

  const inner = (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      className={`relative grid place-items-center rounded-full transition-colors ${active ? 'bg-fg text-bg' : 'bg-card-hover text-muted hover:text-fg'}`}
    >
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 2, x: '-50%' }}
            className="pointer-events-none absolute -top-9 left-1/2 whitespace-nowrap rounded-md border border-line bg-card px-2 py-0.5 text-xs text-fg shadow-sm"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span style={{ width: iconSize, height: iconSize }} className="grid place-items-center [&>svg]:size-full">
        {item.icon}
      </motion.span>
    </motion.div>
  )

  return item.href ? (
    <a href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
      {inner}
    </a>
  ) : (
    <button onClick={item.onClick} aria-label={item.label}>
      {inner}
    </button>
  )
}

const SECTIONS = ['home', 'work', 'projects', 'about', 'contact']

export default function Dock({ extra }: { extra?: Item[] }) {
  const mouseX = useMotionValue(Infinity)
  const { theme, toggle } = useTheme()
  const [active, setActive] = useState('home')

  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: '-45% 0px -50% 0px',
    })
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const nav: Item[] = [
    { label: 'Home', section: 'home', icon: <HomeIcon /> },
    { label: 'Selected work', section: 'work', icon: <GridIcon /> },
    { label: 'All projects', section: 'projects', icon: <ListIcon /> },
    { label: 'About', section: 'about', icon: <UserIcon /> },
    { label: 'Contact', section: 'contact', icon: <MailIcon /> },
  ].map((i) => ({ ...i, onClick: () => scrollToId(i.section!) }))

  const links: Item[] = [
    { label: 'GitHub', href: profile.links.github, icon: <GitHubIcon /> },
    ...(profile.links.linkedin ? [{ label: 'LinkedIn', href: profile.links.linkedin, icon: <LinkedInIcon /> }] : []),
  ]

  const tools: Item[] = [
    ...(extra ?? []),
    { label: theme === 'dark' ? 'Light mode' : 'Dark mode', onClick: toggle, icon: theme === 'dark' ? <SunIcon /> : <MoonIcon /> },
  ]

  const divider = <span className="mx-1 h-6 w-px self-center bg-line" aria-hidden />

  return (
    <motion.nav
      aria-label="Main"
      initial={{ y: 80, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 24 }}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed bottom-4 left-1/2 z-50 flex h-[60px] items-end gap-1.5 rounded-full border border-line bg-bg/80 px-2.5 pb-2.5 shadow-lg shadow-black/5 backdrop-blur-xl md:gap-2"
    >
      {nav.map((i) => (
        <DockIcon key={i.label} item={i} mouseX={mouseX} active={active === i.section} />
      ))}
      {divider}
      {links.map((i) => (
        <span key={i.label} className="hidden sm:block">
          <DockIcon item={i} mouseX={mouseX} active={false} />
        </span>
      ))}
      <span className="hidden sm:contents">{divider}</span>
      {tools.map((i) => (
        <DockIcon key={i.label} item={i} mouseX={mouseX} active={false} />
      ))}
    </motion.nav>
  )
}
