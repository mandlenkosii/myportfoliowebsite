import { animate, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/** Counts up from 0 the first time it scrolls into view. */
export default function NumberTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, value])
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {n}
    </span>
  )
}
