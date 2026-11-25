import { profile } from './config'
import { useGitHub } from './hooks/useGitHub'

export default function App() {
  useGitHub()
  return (
    <div className="relative min-h-svh">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[80vh]" aria-hidden />
      <main className="relative mx-auto max-w-3xl px-5 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">{profile.name}</h1>
        <p className="mt-3 text-muted">{profile.tagline}</p>
      </main>
    </div>
  )
}
