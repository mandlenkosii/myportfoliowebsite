import { motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'

/** Precision crosshair cursor. */
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 400, damping: 32, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 400, damping: 32, mass: 0.4 })
  const [hover, setHover] = useState(false)
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    if (!enabled) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target as HTMLElement
      setHover(!!t.closest?.('a, button, input, [data-cursor]') || document.body.style.cursor === 'pointer')
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <>
      {/* outer reticle */}
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}>
        <motion.div
          animate={{ width: hover ? 44 : 30, height: hover ? 44 : 30, rotate: hover ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="relative"
        >
          {[
            'left-0 top-0 border-l border-t',
            'right-0 top-0 border-r border-t',
            'bottom-0 left-0 border-b border-l',
            'bottom-0 right-0 border-b border-r',
          ].map((c) => (
            <span key={c} className={`absolute size-2 ${c} ${hover ? 'border-signal' : 'border-paper/70'}`} />
          ))}
        </motion.div>
      </motion.div>
      {/* crosshair */}
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[91]" style={{ x, y, translateX: '-50%', translateY: '-50%' }}>
        <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-paper" />
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-paper" />
      </motion.div>
    </>
  )
}
