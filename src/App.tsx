import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import About from './components/About'
import Contact from './components/Contact'
import Cursor from './components/Cursor'
import HUD from './components/HUD'
import Hero from './components/Hero'
import Journey from './components/Journey'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Projects from './components/Projects'
import Skills from './components/Skills'
import { useGitHub } from './hooks/useGitHub'
import { initSmoothScroll } from './lib'

const BackgroundScene = lazy(() => import('./three/BackgroundScene'))

export default function App() {
  const data = useGitHub()
  const [ready, setReady] = useState(false)
  const onLoaded = useCallback(() => setReady(true), [])

  useEffect(() => initSmoothScroll(), [])

  return (
    <div className="noise relative">
      <Loader onDone={onLoaded} />
      <Suspense fallback={null}>
        <BackgroundScene />
      </Suspense>
      <div className="blueprint" />
      <Cursor />
      <HUD />
      <Nav />
      <main className="relative z-10">
        <Hero ready={ready} projects={data.projects} />
        <About data={data} />
        <Projects projects={data.projects} />
        <Skills />
        <Journey projects={data.projects} joined={data.user?.created_at} />
        <Contact />
      </main>
    </div>
  )
}
