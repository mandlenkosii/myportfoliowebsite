import { profile } from '../config'

const initials = profile.name
  .split(' ')
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

/** Animated blueprint-style identity plate, used when no photo is configured. */
export default function IdSchematic() {
  const ticks = Array.from({ length: 72 }, (_, i) => i)
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-navy-950">
      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(79,134,247,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(79,134,247,.12) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3f7a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#070d1a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="170" fill="url(#glow)" />

        {/* rotating outer dial */}
        <g className="origin-center animate-[spin_40s_linear_infinite]" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="160" fill="none" stroke="#94a3b8" strokeOpacity="0.35" />
          {ticks.map((i) => {
            const a = (i / 72) * Math.PI * 2
            const major = i % 6 === 0
            const r1 = 160
            const r2 = major ? 146 : 153
            return (
              <line
                key={i}
                x1={200 + Math.cos(a) * r1}
                y1={200 + Math.sin(a) * r1}
                x2={200 + Math.cos(a) * r2}
                y2={200 + Math.sin(a) * r2}
                stroke={major ? '#f1f5f9' : '#94a3b8'}
                strokeOpacity={major ? 0.7 : 0.4}
              />
            )
          })}
        </g>

        {/* counter-rotating dashed ring */}
        <g style={{ transformOrigin: '200px 200px' }} className="animate-[spin_24s_linear_infinite_reverse]">
          <circle cx="200" cy="200" r="128" fill="none" stroke="#4f86f7" strokeOpacity="0.7" strokeDasharray="4 8" />
          <circle cx="328" cy="200" r="4" fill="#9ec1ff" />
        </g>
        <circle cx="200" cy="200" r="104" fill="none" stroke="#94a3b8" strokeOpacity="0.25" />

        {/* crosshair */}
        <line x1="20" y1="200" x2="380" y2="200" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="2 6" />
        <line x1="200" y1="20" x2="200" y2="380" stroke="#94a3b8" strokeOpacity="0.2" strokeDasharray="2 6" />

        {/* dimension line */}
        <g stroke="#94a3b8" strokeOpacity="0.5" fill="#94a3b8">
          <line x1="96" y1="352" x2="304" y2="352" />
          <line x1="96" y1="346" x2="96" y2="358" />
          <line x1="304" y1="346" x2="304" y2="358" />
        </g>
        <text x="200" y="372" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#94a3b8" letterSpacing="2">
          Ø 208.00 MM
        </text>

        <text
          x="200"
          y="200"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="IBM Plex Sans, sans-serif"
          fontWeight="600"
          fontSize="104"
          fill="#f1f5f9"
          letterSpacing="-4"
        >
          {initials}
        </text>
      </svg>
    </div>
  )
}
