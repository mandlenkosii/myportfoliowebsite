import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function current(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** Reads/sets the theme stored on <html data-theme>, remembering the choice when storage is available. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable: theme still applies for this visit */
    }
  }, [theme])

  const toggle = useCallback(() => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    // Smooth cross-fade where the View Transitions API exists.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(() => setTheme(next))
    } else setTheme(next)
  }, [])

  return { theme, toggle }
}
