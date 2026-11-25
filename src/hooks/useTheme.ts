import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

// The theme lives on <html data-theme>, set before first paint by index.html.
// This tiny store lets every component (orb, dock, palette) share it.
const listeners = new Set<() => void>()

function read(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function write(next: Theme) {
  document.documentElement.dataset.theme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#09090b' : '#fafaf9')
  try {
    localStorage.setItem('theme', next)
  } catch {
    /* storage unavailable: theme still applies for this visit */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'dark' as Theme)

  const toggle = useCallback(() => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark'
    // Smooth cross-fade where the View Transitions API exists.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doc.startViewTransition(() => write(next))
    } else write(next)
  }, [])

  return { theme, toggle }
}
