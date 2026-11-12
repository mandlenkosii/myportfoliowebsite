import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { ReactNode, PointerEvent } from 'react'

/** A card that tilts in 3D toward the pointer, with a soft moving highlight. */
export default function TiltCard({ children, className = '', intensity = 8, glare = '#4f86f7' }: {
  children: ReactNode
  className?: string
  intensity?: number
  glare?: string
}) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 200, damping: 22 })
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 200, damping: 22 })
  const gx = useTransform(mx, (v) => `${v * 100}%`)
  const gy = useTransform(my, (v) => `${v * 100}%`)
  const bg = useMotionTemplate`radial-gradient(380px circle at ${gx} ${gy}, ${glare}22, transparent 60%)`

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const leave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        onPointerMove={move}
        onPointerLeave={leave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={`group relative h-full ${className}`}
      >
        <motion.div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: bg }} />
        {children}
      </motion.div>
    </div>
  )
}
