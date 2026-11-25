import About from './components/About'
import CommandPalette, { openPalette } from './components/CommandPalette'
import Contact from './components/Contact'
import Dock from './components/Dock'
import Hero from './components/Hero'
import ProjectIndex from './components/ProjectIndex'
import SelectedWork from './components/SelectedWork'
import { useGitHub } from './hooks/useGitHub'
import { useTheme } from './hooks/useTheme'
import { CommandIcon } from './components/icons'

export default function App() {
  const data = useGitHub()
  const { theme } = useTheme()

  return (
    <div className="relative min-h-svh">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[90vh]" aria-hidden />
      <main className="relative mx-auto max-w-5xl px-5 md:px-8">
        <Hero projects={data.projects} dark={theme === 'dark'} />
        <SelectedWork projects={data.projects} />
        <ProjectIndex projects={data.projects} />
        <About />
        <Contact />
      </main>
      <Dock extra={[{ label: 'Search  ⌘K', onClick: openPalette, icon: <CommandIcon /> }]} />
      <CommandPalette projects={data.projects} />
    </div>
  )
}
