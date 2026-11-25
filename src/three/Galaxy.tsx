import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Category, Project } from '../data/projects'

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

// One orbit per category, inner to outer.
const RINGS: Category[] = ['Full-Stack', 'Web Apps', 'Client Sites', 'JavaScript']
const RADII = [1.55, 2.25, 2.95, 3.6]
const SPEEDS = [0.11, 0.08, 0.06, 0.045]

type Palette = { fg: string; muted: string; accent: string; dust: string }
const palette = (dark: boolean): Palette =>
  dark
    ? { fg: '#fafafa', muted: '#71717a', accent: '#6b8cff', dust: '#c7d2fe' }
    : { fg: '#0a0a0a', muted: '#a1a1aa', accent: '#2f5bea', dust: '#3f3f46' }

/** Spiral-armed star disc. */
function Dust({ colors }: { colors: Palette }) {
  const ref = useRef<THREE.Points>(null!)
  const count = coarse ? 1600 : 3200
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const inner = new THREE.Color(colors.accent)
    const outer = new THREE.Color(colors.dust)
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const arm = i % 3
      const r = 0.35 + Math.pow(Math.random(), 1.6) * 4.1
      const spread = (Math.random() - 0.5) * (0.5 + r * 0.12)
      const a = (arm / 3) * Math.PI * 2 + r * 1.15 + spread
      const y = (Math.random() - 0.5) * 0.18 * Math.max(0.2, 1 - r / 4.5)
      pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3)
      c.copy(inner).lerp(outer, Math.min(1, r / 3.2))
      col.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [count, colors])

  useFrame((_, dt) => {
    if (!reduced) ref.current.rotation.y += dt * 0.025
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={coarse ? 0.035 : 0.028} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Core({ colors }: { colors: Palette }) {
  const halo = useRef<THREE.Mesh>(null!)
  useFrame((s) => {
    if (reduced) return
    halo.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.06)
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color={colors.accent} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={0.06} depthWrite={false} />
      </mesh>
    </group>
  )
}

function OrbitLine({ radius, color }: { radius: number; color: string }) {
  const pts = useMemo(() => {
    const p: [number, number, number][] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      p.push([Math.cos(a) * radius, 0, Math.sin(a) * radius])
    }
    return p
  }, [radius])
  return <Line points={pts} color={color} lineWidth={1} transparent opacity={0.18} />
}

function Planet({ p, angle, radius, colors, hovered, onHover, onSelect }: {
  p: Project
  angle: number
  radius: number
  colors: Palette
  hovered: boolean
  onHover: (repo: string | null) => void
  onSelect: (p: Project) => void
}) {
  const ref = useRef<THREE.Group>(null!)
  const size = p.featured ? 0.13 : 0.07
  const color = p.featured ? colors.accent : colors.fg

  useFrame((s, dt) => {
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, hovered ? 1.8 : 1, 10, dt))
    if (!reduced) ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.9 + angle * 4) * 0.04
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(p.repo)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    onHover(null)
    document.body.style.cursor = ''
  }

  return (
    <group position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
      <group ref={ref}>
        <mesh
          onPointerOver={over}
          onPointerOut={out}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(p)
          }}
        >
          <sphereGeometry args={[size, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.9 : 0.35} roughness={0.4} metalness={0.2} />
        </mesh>
        {/* larger invisible hit area so small planets are easy to tap */}
        <mesh onPointerOver={over} onPointerOut={out} onClick={(e) => (e.stopPropagation(), onSelect(p))}>
          <sphereGeometry args={[Math.max(size * 2.2, 0.2), 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {p.featured && (
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[size * 1.8, 0.006, 8, 48]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        )}
      </group>
      {hovered && (
        <Html center position={[0, size + 0.32, 0]} className="pointer-events-none" zIndexRange={[30, 0]}>
          <div className="animate-[fadeIn_.15s_ease-out] whitespace-nowrap rounded-xl border border-line bg-bg/90 px-3 py-1.5 text-center shadow-sm backdrop-blur">
            <div className="text-sm font-medium text-fg">{p.title}</div>
            <div className="text-[11px] text-muted">{p.tagline}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function Ring({ index, projects, colors, hovered, onHover, onSelect }: {
  index: number
  projects: Project[]
  colors: Palette
  hovered: string | null
  onHover: (r: string | null) => void
  onSelect: (p: Project) => void
}) {
  const ref = useRef<THREE.Group>(null!)
  const paused = projects.some((p) => p.repo === hovered)
  useFrame((_, dt) => {
    if (!paused && !reduced) ref.current.rotation.y += dt * SPEEDS[index]
  })
  return (
    <group ref={ref}>
      <OrbitLine radius={RADII[index]} color={colors.fg} />
      {projects.map((p, i) => (
        <Planet
          key={p.repo}
          p={p}
          angle={index * 1.3 + (i / projects.length) * Math.PI * 2}
          radius={RADII[index]}
          colors={colors}
          hovered={hovered === p.repo}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}

function Scene({ projects, dark, onSelect }: { projects: Project[]; dark: boolean; onSelect: (p: Project) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const colors = useMemo(() => palette(dark), [dark])
  const rings = useMemo(() => RINGS.map((c) => projects.filter((p) => p.category === c)), [projects])

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={8} color={colors.accent} distance={6} />
      <directionalLight position={[3, 5, 4]} intensity={0.8} />
      <group rotation={[0.42, 0, -0.12]}>
        <Dust colors={colors} />
        <Core colors={colors} />
        {rings.map((list, i) => (
          <Ring key={RINGS[i]} index={i} projects={list} colors={colors} hovered={hovered} onHover={setHovered} onSelect={onSelect} />
        ))}
      </group>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!coarse}
        rotateSpeed={0.45}
        enableDamping
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.62}
        autoRotate={!hovered && !reduced}
        autoRotateSpeed={0.35}
      />
    </>
  )
}

export default function Galaxy({ projects, dark, active = true, onSelect }: {
  projects: Project[]
  dark: boolean
  active?: boolean
  onSelect: (p: Project) => void
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.7, 9.6], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      aria-label="Project galaxy: each planet is a project. Drag to rotate, click a planet to open it."
    >
      <Scene projects={projects} dark={dark} onSelect={onSelect} />
    </Canvas>
  )
}
