import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { profile } from '../config'
import { categoryColors, languageColors, type Project } from '../data/projects'
import { formatMonth, lockScroll } from '../lib'
import { Brackets, SpecRow } from './Lab'
import { CloseIcon, ExternalIcon, GitHubIcon } from './icons'

export default function ProjectModal({ project, code, onClose }: { project: Project | null; code: string; onClose: () => void }) {
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    setPreview(false)
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
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            key={project.repo}
            initial={{ y: 50, opacity: 0, rotateX: 10 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{ transformPerspective: 1200 }}
            className="relative max-h-[92svh] w-full max-w-4xl overflow-y-auto overscroll-contain border border-steel/20 bg-navy-950/95 backdrop-blur-xl"
            data-lenis-prevent
          >
            <Brackets size={14} color="#4f86f7" />
            {/* title bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-steel/15 bg-navy-950/95 px-5 py-3 font-mono text-[10px] tracking-[0.2em] text-steel md:px-8">
              <span>
                TECHNICAL DOSSIER · <span className="text-paper">{code}</span>
              </span>
              <button onClick={onClose} className="-mr-2 grid size-8 place-items-center text-steel hover:bg-white/5 hover:text-paper" aria-label="Close">
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="grid gap-8 p-5 md:grid-cols-[1.4fr_1fr] md:p-8">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest" style={{ color: categoryColors[project.category] }}>
                  <span className="size-1.5" style={{ background: categoryColors[project.category] }} />
                  {project.category.toUpperCase()}
                  {project.featured && <span className="ml-2 border border-signal/50 px-1.5 py-0.5 text-ice">PRIORITY</span>}
                </div>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-paper md:text-5xl">{project.title}</h3>
                <p className="mt-2 text-lg text-ice/85">{project.tagline}</p>

                <div className="mt-6 font-mono text-[10px] tracking-[0.2em] text-steel">01 · ABSTRACT</div>
                <p className="mt-2 font-light leading-relaxed text-paper/75">{project.description}</p>

                {project.highlights.length > 0 && (
                  <>
                    <div className="mt-6 font-mono text-[10px] tracking-[0.2em] text-steel">02 · KEY FINDINGS</div>
                    <ol className="mt-2 space-y-1.5">
                      {project.highlights.map((h, i) => (
                        <motion.li
                          key={h}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.05 }}
                          className="flex gap-3 border-l border-signal/40 bg-white/[0.02] py-2 pl-3 pr-2 text-sm text-paper/80"
                        >
                          <span className="font-mono text-xs text-signal">{String(i + 1).padStart(2, '0')}</span>
                          {h}
                        </motion.li>
                      ))}
                    </ol>
                  </>
                )}
              </div>

              <div>
                <div className="border border-steel/15 p-4">
                  <div className="mb-2 font-mono text-[10px] tracking-[0.2em] text-steel">SPECIFICATIONS</div>
                  <SpecRow k="Ref" v={<span className="font-mono">{code}</span>} />
                  <SpecRow k="Repository" v={<span className="font-mono text-xs">{project.repo}</span>} />
                  <SpecRow
                    k="Language"
                    v={
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-1.5" style={{ background: languageColors[project.language] ?? languageColors.Other }} />
                        {project.language}
                      </span>
                    }
                  />
                  <SpecRow k="Initiated" v={formatMonth(project.created)} />
                  <SpecRow k="Last update" v={formatMonth(project.updated)} />
                  <SpecRow k="Status" v={<span className="font-mono text-xs text-ice">{project.live ? '● DEPLOYED' : '○ SOURCE ONLY'}</span>} />
                </div>

                <div className="mt-4 font-mono text-[10px] tracking-[0.2em] text-steel">STACK</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="border border-steel/20 px-2 py-1 font-mono text-[11px] text-paper/75">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-2">
                  <a
                    href={`${profile.links.github}/${project.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-paper py-3 text-sm font-semibold text-ink transition-colors hover:bg-ice"
                  >
                    <GitHubIcon className="size-4" /> View source
                  </a>
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 border border-steel/30 py-3 text-sm font-medium text-paper transition-colors hover:border-signal"
                    >
                      <ExternalIcon /> Visit live site
                    </a>
                  )}
                  {project.live && (
                    <button
                      onClick={() => setPreview((p) => !p)}
                      className="hidden py-2 font-mono text-[11px] tracking-wider text-steel transition-colors hover:text-paper md:block"
                    >
                      {preview ? '[ − ] HIDE PREVIEW' : '[ + ] PREVIEW IN PAGE'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {preview && project.live && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-5 pb-8 md:px-8">
                  <div className="border border-steel/20 bg-black">
                    <div className="flex items-center gap-3 border-b border-steel/15 px-4 py-2 font-mono text-[10px] text-steel">
                      <span className="text-signal">● LIVE FEED</span>
                      <span className="truncate">{project.live}</span>
                    </div>
                    <div className="relative h-[420px] overflow-hidden">
                      <iframe
                        src={project.live}
                        title={`${project.title} preview`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                        style={{ width: '200%', height: '200%', transform: 'scale(0.5)' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
