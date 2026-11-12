import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

const LOG = [
  'Initialising render pipeline',
  'Loading WebGL instruments',
  'Fetching repository manifest',
  'Calibrating orbital index',
  'Compiling capability matrix',
  'All systems nominal',
]

export default function Loader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    let n = 0
    const id = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 7))
      setCount(n)
      if (n >= 100) {
        clearInterval(id)
        const finish = () =>
          setTimeout(() => {
            setShow(false)
            onDone()
          }, 350)
        if (document.fonts) document.fonts.ready.finally(finish)
        else finish()
      }
    }, 40)
    return () => clearInterval(id)
  }, [onDone])

  const lines = Math.min(LOG.length, Math.floor((count / 100) * LOG.length) + 1)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink px-6"
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="blueprint" />
          <div className="relative w-full max-w-md font-mono text-xs">
            <div className="mb-6 flex items-center justify-between text-steel">
              <span>MS-LAB // BOOT SEQUENCE</span>
              <span className="text-paper tabular-nums">{String(count).padStart(3, '0')}%</span>
            </div>
            <div className="space-y-1.5">
              {LOG.slice(0, lines).map((l, i) => (
                <motion.div key={l} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 text-steel/80">
                  <span className={i === lines - 1 && count < 100 ? 'text-ice' : 'text-signal'}>{i === lines - 1 && count < 100 ? '[ .. ]' : '[ OK ]'}</span>
                  <span className={i === lines - 1 ? 'text-paper' : ''}>{l}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 h-px w-full bg-steel/20">
              <div className="h-px bg-signal transition-[width] duration-100" style={{ width: `${count}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-steel/50">
              <span>-26.2041° S  28.0473° E</span>
              <span>v2.0</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
