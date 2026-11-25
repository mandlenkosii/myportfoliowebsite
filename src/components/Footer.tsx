import { useEffect, useState } from 'react'
import { profile } from '../config'

function LocalTime() {
  const fmt = () => new Date().toLocaleTimeString('en-GB', { timeZone: profile.timezone, hour: '2-digit', minute: '2-digit' })
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15_000)
    return () => clearInterval(id)
  })
  return <span className="tabular-nums">{t}</span>
}

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-2 pb-32 pt-10 text-xs text-subtle md:flex-row">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span>
        Johannesburg · <LocalTime /> SAST
      </span>
      <span>Built with React, Three.js &amp; too much coffee</span>
    </footer>
  )
}
