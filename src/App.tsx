import { lazy, Suspense } from 'react'
import About from './components/About'
import CommandPalette, { openPalette } from './components/CommandPalette'
import Contact from './components/Contact'
import Dock from './components/Dock'
import Footer from './components/Footer'
import Resume from './components/Resume'
import Hero from './components/Hero'
import ProjectIndex from './components/ProjectIndex'
import SelectedWork from './components/SelectedWork'
import { useGitHub } from './hooks/useGitHub'
import { useTheme } from './hooks/useTheme'
import { CommandIcon } from './components/icons'

const StarField = lazy(() => import('./three/StarField'))

export default function App() {
  const data = useGitHub()
  const { theme } = useTheme()

  return (
    <div className="relative min-h-svh">
      <a href="#work" className="sr-only z-[90] rounded-full bg-fg px-4 py-2 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to work
      </a>
      <Suspense fallback={null}>
        <StarField dark={theme === 'dark'} />
      </Suspense>
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[90vh]" aria-hidden />
      <main id="main" className="relative mx-auto max-w-5xl px-5 md:px-8">
        <Hero projects={data.projects} dark={theme === 'dark'} />
        <SelectedWork projects={data.projects} />
        <ProjectIndex projects={data.projects} />
        <About />
        <Contact />
        <Resume />
        <Footer />
      </main>
      <Dock extra={[{ label: 'Search  ⌘K', onClick: openPalette, icon: <CommandIcon /> }]} />
      <CommandPalette projects={data.projects} />
    </div>
  )
}
