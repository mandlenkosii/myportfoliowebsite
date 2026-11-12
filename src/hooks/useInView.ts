import { useEffect, useRef, useState } from 'react'

/** Tracks whether an element is near the viewport, so offscreen WebGL canvases can stop rendering. */
export function useInView<T extends HTMLElement>(rootMargin = '200px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return [ref, inView] as const
}
