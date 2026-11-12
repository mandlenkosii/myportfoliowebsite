import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { categoryCodes, categoryColors, type Category, type Project } from '../data/projects'

const RINGS: Category[] = ['Full-Stack', 'Web Apps', 'Client Sites', 'JavaScript']
const RADII = [2.4, 3.6, 4.8, 6.0]
const SPEEDS = [0.1, 0.075, 0.055, 0.04]
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Props {
  projects: Project[]
  active: string
  onSelect: (p: Project) => void
  inView: boolean
}

function Core() {
  const shell = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (!reduced) shell.current.rotation.y += dt * 0.2
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshStandardMaterial color="#1e3f7a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshBasicMaterial color="#94a3b8" wireframe transparent opacity={0.35} />
      </mesh>
      <pointLight intensity={25} color="#9ec1ff" distance={14} />
      <Html center position={[0, -1.35, 0]} className="pointer-events-none select-none">
        <div className="whitespace-nowrap font-mono text-[10px] tracking-[0.25em] text-slate-400">ORIGIN · @MANDLENKOSII</div>
      </Html>
    </group>
  )
}

function Orbit({ radius, color }: { radius: number; color: string }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius])
    }
    return pts
  }, [radius])
  return <Line points={points} color={color} lineWidth={1} transparent opacity={0.35} dashed dashSize={0.2} gapSize={0.12} />
}

function Planet({ project, code, angle, radius, dimmed, hovered, setHovered, onSelect }: {
  project: Project
  code: string
  angle: number
  radius: number
  dimmed: boolean
  hovered: boolean
  setHovered: (r: string | null) => void
  onSelect: (p: Project) => void
}) {
  const mesh = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const color = categoryColors[project.category]
  const size = project.featured ? 0.28 : 0.17

  useFrame((state, dt) => {
    const target = hovered ? 1.6 : dimmed ? 0.6 : 1
    mesh.current.scale.setScalar(THREE.MathUtils.damp(mesh.current.scale.x, target, 8, dt))
    mesh.current.rotation.y += dt * 0.5
    mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.8 + angle * 3) * 0.06
    mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, dimmed ? 0.15 : 1, 6, dt)
    mat.current.emissiveIntensity = THREE.MathUtils.damp(mat.current.emissiveIntensity, hovered ? 0.9 : dimmed ? 0.02 : 0.18, 6, dt)
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (dimmed) return
    setHovered(project.repo)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    setHovered(null)
    document.body.style.cursor = ''
  }

  return (
    <group position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
      {/* drop line to the grid plane */}
      <Line points={[[0, 0, 0], [0, -0.6, 0]]} color={color} lineWidth={0.6} transparent opacity={dimmed ? 0.05 : 0.3} />
      <group ref={mesh}>
        <mesh
          onPointerOver={over}
          onPointerOut={out}
          onClick={(e) => {
            e.stopPropagation()
            if (!dimmed) onSelect(project)
          }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.18} roughness={0.35} metalness={0.55} transparent />
        </mesh>
        {project.featured && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[size * 1.75, 0.008, 8, 64]} />
            <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.08 : 0.6} />
          </mesh>
        )}
      </group>
      {hovered && (
        <Html position={[size + 0.2, size + 0.35, 0]} className="pointer-events-none" zIndexRange={[20, 0]}>
          <div className="relative -translate-y-full animate-[fadeUp_.2s_ease-out] whitespace-nowrap border border-slate-400/30 bg-[#070d1a]/90 px-3 py-2 backdrop-blur">
            <div className="font-mono text-[10px] tracking-widest" style={{ color }}>
              {code} · {project.category.toUpperCase()}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-slate-100">{project.title}</div>
            <div className="text-[11px] text-slate-400">{project.tagline}</div>
            <div className="mt-1.5 font-mono text-[9px] tracking-widest text-slate-500">[ CLICK TO INSPECT ]</div>
            <span className="absolute -bottom-3 left-0 h-3 w-px bg-slate-400/50" />
          </div>
        </Html>
      )}
    </group>
  )
}

function Ring({ index, projects, active, hovered, setHovered, onSelect }: {
  index: number
  projects: Project[]
  active: string
  hovered: string | null
  setHovered: (r: string | null) => void
  onSelect: (p: Project) => void
}) {
  const group = useRef<THREE.Group>(null!)
  const paused = projects.some((p) => p.repo === hovered)
  useFrame((_, dt) => {
    if (!paused && !reduced) group.current.rotation.y += dt * SPEEDS[index]
  })
  const offset = index * 0.9
  const cat = RINGS[index]
  return (
    <group ref={group}>
      <Orbit radius={RADII[index]} color={categoryColors[cat]} />
      {projects.map((p, i) => (
        <Planet
          key={p.repo}
          project={p}
          code={`${categoryCodes[cat]}-${String(i + 1).padStart(2, '0')}`}
          angle={offset + (i / projects.length) * Math.PI * 2}
          radius={RADII[index]}
          dimmed={active !== 'All' && (active === 'Featured' ? !p.featured : p.category !== active)}
          hovered={hovered === p.repo}
          setHovered={setHovered}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}

export default function ProjectGalaxy({ projects, active, onSelect, inView }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const byRing = useMemo(() => RINGS.map((c) => projects.filter((p) => p.category === c)), [projects])
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <Canvas
      frameloop={inView ? 'always' : 'never'}
      camera={{ position: [0, isMobile ? 11 : 6.5, isMobile ? 13 : 10], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => setHovered(null)}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1.8} />
      <pointLight position={[-6, 2, -4]} intensity={25} color="#4f86f7" />
      <group rotation={[0.12, 0, -0.06]}>
        <polarGridHelper args={[7, 24, 7, 96, '#1e3f7a', '#13284d']} position={[0, -0.6, 0]} />
        <Core />
        {byRing.map((list, i) => (
          <Ring key={RINGS[i]} index={i} projects={list} active={active} hovered={hovered} setHovered={setHovered} onSelect={onSelect} />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={!isMobile}
        enableDamping
        rotateSpeed={0.5}
        minPolarAngle={0.35}
        maxPolarAngle={1.35}
        autoRotate={!hovered && !reduced}
        autoRotateSpeed={0.2}
      />
    </Canvas>
  )
}
