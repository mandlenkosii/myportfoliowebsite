import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { profile } from '../config'
import type { Project } from '../data/projects'
import { useTheme } from '../hooks/useTheme'
import { lockScroll, scrollToId } from '../lib'
import ProjectSheet from './ProjectSheet'
import { ArrowIcon, CopyIcon, GitHubIcon, GridIcon, LinkedInIcon, MoonIcon, SearchIcon } from './icons'

type Cmd = { id: string; group: string; label: string; hint?: string; icon: ReactNode; run: () => void }

const listeners = new Set<(open: boolean) => void>()
/** Open the palette from anywhere (e.g. the dock). */
export const openPalette = () => listeners.forEach((l) => l(true))

export default function CommandPalette({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const [sheet, setSheet] = useState<Project | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const { toggle } = useTheme()
  const closeSheet = useCallback(() => setSheet(null), [])

  useEffect(() => {
    listeners.add(setOpen)
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.('input, textarea')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      listeners.delete(setOpen)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setQ('')
    setI(0)
    lockScroll(true)
    const t = setTimeout(() => input.current?.focus(), 30)
    return () => {
      clearTimeout(t)
      lockScroll(false)
    }
  }, [open])

  const commands = useMemo<Cmd[]>(() => {
    const close = () => setOpen(false)
    const go = (id: string) => () => {
      close()
      setTimeout(() => scrollToId(id), 60)
    }
    return [
      { id: 's-work', group: 'Navigate', label: 'Selected work', icon: <GridIcon className="size-4" />, run: go('work') },
      { id: 's-projects', group: 'Navigate', label: 'All projects', icon: <GridIcon className="size-4" />, run: go('projects') },
      { id: 's-about', group: 'Navigate', label: 'About me', icon: <GridIcon className="size-4" />, run: go('about') },
      { id: 's-contact', group: 'Navigate', label: 'Contact', icon: <GridIcon className="size-4" />, run: go('contact') },
      ...projects.map((p) => ({
        id: `p-${p.repo}`,
        group: 'Projects',
        label: p.title,
        hint: p.tech.slice(0, 2).join(' · '),
        icon: <ArrowIcon className="size-4" />,
        run: () => {
          close()
          setSheet(p)
        },
      })),
      { id: 'a-theme', group: 'Actions', label: 'Toggle light / dark', icon: <MoonIcon className="size-4" />, run: () => (close(), toggle()) },
      ...(profile.email
        ? [{ id: 'a-email', group: 'Actions', label: 'Copy email address', hint: profile.email, icon: <CopyIcon className="size-4" />, run: () => (navigator.clipboard?.writeText(profile.email), close()) }]
        : []),
      { id: 'a-gh', group: 'Actions', label: 'Open GitHub', icon: <GitHubIcon className="size-4" />, run: () => (window.open(profile.links.github, '_blank'), close()) },
      ...(profile.links.linkedin
        ? [{ id: 'a-li', group: 'Actions', label: 'Open LinkedIn', icon: <LinkedInIcon className="size-4" />, run: () => (window.open(profile.links.linkedin, '_blank'), close()) }]
        : []),
    ]
  }, [projects, toggle])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return commands.filter((c) => c.group !== 'Projects' || projects.find((p) => `p-${p.repo}` === c.id)?.featured)
    return commands.filter((c) => `${c.label} ${c.hint ?? ''} ${c.group}`.toLowerCase().includes(s))
  }, [q, commands, projects])

  useEffect(() => setI(0), [q])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${i}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [i])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setI((n) => Math.min(n + 1, results.length - 1)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setI((n) => Math.max(n - 1, 0)))
    else if (e.key === 'Enter') results[i]?.run()
    else if (e.key === 'Escape') setOpen(false)
  }

  let lastGroup = ''
  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ scale: 0.96, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <SearchIcon className="size-4 text-subtle" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search projects, sections, actions…"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
                  aria-activedescendant={results[i] ? `cmd-${results[i].id}` : undefined}
                />
                <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-subtle">esc</kbd>
              </div>
              <ul ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
                {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-subtle">Nothing matches “{q}”.</li>}
                {results.map((c, idx) => {
                  const header = c.group !== lastGroup
                  lastGroup = c.group
                  return (
                    <li key={c.id}>
                      {header && <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-subtle">{c.group}</div>}
                      <button
                        id={`cmd-${c.id}`}
                        data-index={idx}
                        role="option"
                        aria-selected={idx === i}
                        onMouseMove={() => setI(idx)}
                        onClick={c.run}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${idx === i ? 'bg-card-hover text-fg' : 'text-muted'}`}
                      >
                        <span className="text-subtle">{c.icon}</span>
                        <span className="flex-1 truncate">{c.label}</span>
                        {c.hint && <span className="truncate font-mono text-[11px] text-subtle">{c.hint}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[10px] text-subtle">
                <span>↑↓ move</span>
                <span>↵ open</span>
                <span className="ml-auto">⌘K / Ctrl K</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ProjectSheet project={sheet} onClose={closeSheet} />
    </>,
    document.body,
  )
}
