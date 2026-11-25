import Dock from './components/Dock'
import Hero from './components/Hero'
import { useGitHub } from './hooks/useGitHub'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const data = useGitHub()
  const { theme } = useTheme()

  return (
    <div className="relative min-h-svh">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[90vh]" aria-hidden />
      <main className="relative mx-auto max-w-5xl px-5 md:px-8">
        <Hero projects={data.projects} dark={theme === 'dark'} />
      </main>
      <Dock />
    </div>
  )
}
