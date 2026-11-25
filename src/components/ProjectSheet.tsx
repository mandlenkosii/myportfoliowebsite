import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { profile } from '../config'
import type { Project } from '../data/projects'
import { formatMonth, lockScroll } from '../lib'
import { CloseIcon, ExternalIcon, GitHubIcon } from './icons'

/** Detail sheet for a single project. */
export default function ProjectSheet({ project, onClose }: { project: Project | null; onClose: () => void }) {
  useEffect(() => {
    if (!project) return
    lockScroll(true)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative max-h-[88svh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-bg p-6 shadow-2xl sm:rounded-3xl md:p-8"
          >
            <button onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-muted hover:bg-card-hover hover:text-fg" aria-label="Close">
              <CloseIcon className="size-4" />
            </button>

            <p className="font-mono text-xs text-subtle">
              {project.category} · {formatMonth(project.created)}
            </p>
            <h3 className="mt-2 pr-10 text-2xl font-semibold tracking-tight md:text-3xl">{project.title}</h3>
            <p className="mt-1 text-muted">{project.tagline}</p>

            <p className="mt-5 leading-relaxed">{project.description}</p>

            {project.highlights.length > 0 && (
              <ul className="mt-5 space-y-2">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-muted">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg">
                  Visit live site <ExternalIcon className="size-3.5" />
                </a>
              )}
              <a
                href={`${profile.links.github}/${project.repo}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:bg-card-hover"
              >
                <GitHubIcon className="size-4" /> Source code
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
