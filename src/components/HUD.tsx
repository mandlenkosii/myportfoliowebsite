import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/** Fixed instrument readouts around the viewport edges (desktop only). */
export default function HUD() {
  const coords = useRef<HTMLSpanElement>(null)
  const [time, setTime] = useState('')
  const { scrollYProgress } = useScroll()
  const depth = useTransform(scrollYProgress, (v) => `${(v * 100).toFixed(1).padStart(5, '0')}%`)
  const markerY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (coords.current) coords.current.textContent = `X ${String(e.clientX).padStart(4, '0')}  Y ${String(e.clientY).padStart(4, '0')}`
    }
    window.addEventListener('pointermove', move)
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Johannesburg', hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => {
      window.removeEventListener('pointermove', move)
      clearInterval(id)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-40 hidden font-mono text-[10px] tracking-widest text-steel/60 lg:block" aria-hidden>
      {/* left vertical depth gauge */}
      <div className="absolute bottom-24 left-6 top-28 w-3">
        <div
          className="h-full w-full opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,.6) 1px, transparent 1px), linear-gradient(rgba(148,163,184,.3) 1px, transparent 1px)',
            backgroundSize: '12px 50px, 6px 10px',
            backgroundRepeat: 'repeat-y',
          }}
        />
        <motion.div className="absolute -left-1 flex items-center gap-2" style={{ top: markerY }}>
          <span className="h-px w-5 bg-signal" />
          <motion.span className="text-ice">{depth}</motion.span>
        </motion.div>
      </div>
      <div className="absolute left-6 top-24 [writing-mode:vertical-rl]">DEPTH</div>

      {/* bottom readouts */}
      <div className="absolute bottom-5 left-6 flex gap-6">
        <span ref={coords}>X 0000  Y 0000</span>
        <span>
          <span className="text-signal">●</span> SYS NOMINAL
        </span>
      </div>
      <div className="absolute bottom-5 right-6 flex gap-6">
        <span>-26.2041° S · 28.0473° E</span>
        <span className="text-paper/70">JHB {time}</span>
      </div>
    </div>
  )
}
