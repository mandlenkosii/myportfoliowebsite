import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { skills, skillGroupColors } from '../data/projects'

const RADIUS = 3
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const tmp = new THREE.Vector3()

function Atom({ name, color, position, muted }: { name: string; color: string; position: THREE.Vector3; muted: boolean }) {
  const anchor = useRef<THREE.Group>(null!)
  const el = useRef<HTMLDivElement>(null!)
  const [hover, setHover] = useState(false)

  useFrame(() => {
    anchor.current.getWorldPosition(tmp)
    const depth = (tmp.z + RADIUS) / (RADIUS * 2) // 0 back … 1 front
    const opacity = muted ? 0.1 : 0.15 + depth * 0.85
    if (el.current) {
      el.current.style.opacity = opacity.toFixed(2)
      el.current.style.transform = `scale(${((hover ? 1.2 : 1) * (0.75 + depth * 0.35)).toFixed(3)})`
      el.current.style.zIndex = String(Math.round(depth * 100))
    }
  })

  return (
    <group ref={anchor} position={position}>
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={muted ? 0 : 0.5} transparent opacity={muted ? 0.2 : 1} />
      </mesh>
      <Html center zIndexRange={[50, 0]} position={[0, 0.24, 0]}>
        <div
          ref={el}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          className="cursor-default select-none whitespace-nowrap border px-2 py-0.5 font-mono text-[11px] tracking-wide transition-colors duration-200 md:text-xs"
          style={{
            color: hover ? '#05080f' : color,
            background: hover ? color : 'rgba(7,13,26,0.65)',
            borderColor: hover ? color : 'rgba(148,163,184,0.2)',
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}

function Lattice({ activeGroup }: { activeGroup: string | null }) {
  const group = useRef<THREE.Group>(null!)

  const positions = useMemo(() => {
    const n = skills.length
    const golden = Math.PI * (3 - Math.sqrt(5))
    return skills.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      return new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(RADIUS)
    })
  }, [])

  // Bond each atom to its 3 nearest neighbours.
  const bonds = useMemo(() => {
    const seen = new Set<string>()
    const pts: number[] = []
    positions.forEach((a, i) => {
      positions
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (seen.has(key)) return
          seen.add(key)
          pts.push(a.x, a.y, a.z, positions[j].x, positions[j].y, positions[j].z)
        })
    })
    return new Float32Array(pts)
  }, [positions])

  useFrame((state, dt) => {
    if (reduced) return
    group.current.rotation.y += dt * 0.12
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.35, 2, dt)
  })

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bonds, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#4f86f7" transparent opacity={0.28} />
      </lineSegments>
      {skills.map((s, i) => (
        <Atom key={s.name} name={s.name} color={skillGroupColors[s.group]} position={positions[i]} muted={!!activeGroup && activeGroup !== s.group} />
      ))}
      {/* nucleus */}
      <mesh>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#94a3b8" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 1.02, 32, 16]} />
        <meshBasicMaterial color="#1e3f7a" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

export default function SkillsSphere({ inView, activeGroup }: { inView: boolean; activeGroup: string | null }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <Canvas frameloop={inView ? 'always' : 'never'} camera={{ position: [0, 0, 8.2], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <Lattice activeGroup={activeGroup} />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={!isMobile} rotateSpeed={0.6} enableDamping />
    </Canvas>
  )
}
