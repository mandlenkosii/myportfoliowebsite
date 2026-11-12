import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Line } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const C = {
  navy: '#16305e',
  blue: '#4f86f7',
  ice: '#9ec1ff',
  steel: '#94a3b8',
  white: '#f1f5f9',
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? window.scrollY / max : 0
}

/** Dust motes drifting through the lab. */
function Dust({ count = isMobile ? 700 : 1800 }) {
  const ref = useRef<THREE.Points>(null!)
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [C.white, C.steel, C.ice, C.blue].map((c) => new THREE.Color(c))
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 30, -Math.random() * 35 + 5], i * 3)
      const c = palette[Math.floor(Math.random() * palette.length)]
      col.set([c.r, c.g, c.b], i * 3)
    }
    return [pos, col]
  }, [count])

  useFrame((_, dt) => {
    if (reduced) return
    ref.current.rotation.y += dt * 0.008
    ref.current.position.y = (ref.current.position.y + dt * 0.05) % 2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/** A gimbal ring with graduated tick marks, like a dial on an instrument. */
function GimbalRing({ radius, color, ticks = 72, width = 0.008 }: { radius: number; color: string; ticks?: number; width?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    for (let i = 0; i < ticks; i++) {
      const a = (i / ticks) * Math.PI * 2
      const major = i % 6 === 0
      const len = major ? 0.16 : 0.07
      m.position.set(Math.cos(a) * (radius + len / 2), Math.sin(a) * (radius + len / 2), 0)
      m.rotation.set(0, 0, a)
      m.scale.set(len, major ? 0.014 : 0.008, 0.008)
      m.updateMatrix()
      inst.current.setMatrixAt(i, m.matrix)
    }
    inst.current.instanceMatrix.needsUpdate = true
  }, [radius, ticks])

  return (
    <group>
      <mesh>
        <torusGeometry args={[radius, width, 8, 180]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, ticks]}>
        <boxGeometry />
        <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function Electron({ radius, speed, tilt, color }: { radius: number; speed: number; tilt: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  const path = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push([Math.cos(a) * radius, Math.sin(a) * radius * 0.35, Math.sin(a) * radius])
    }
    return pts
  }, [radius])
  useFrame((state) => {
    const t = state.clock.elapsedTime * (reduced ? 0 : speed)
    ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius * 0.35, Math.sin(t) * radius)
  })
  return (
    <group rotation={tilt}>
      <Line points={path} color={color} lineWidth={0.7} transparent opacity={0.3} dashed dashSize={0.06} gapSize={0.06} />
      <mesh ref={ref}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Axes() {
  const L = 3.4
  return (
    <group>
      <Line points={[[-L, 0, 0], [L, 0, 0]]} color={C.steel} lineWidth={0.8} dashed dashSize={0.12} gapSize={0.08} transparent opacity={0.45} />
      <Line points={[[0, -L, 0], [0, L, 0]]} color={C.steel} lineWidth={0.8} dashed dashSize={0.12} gapSize={0.08} transparent opacity={0.45} />
      <Line points={[[0, 0, -L], [0, 0, L]]} color={C.blue} lineWidth={0.8} dashed dashSize={0.12} gapSize={0.08} transparent opacity={0.45} />
    </group>
  )
}

function Instrument() {
  const group = useRef<THREE.Group>(null!)
  const g1 = useRef<THREE.Group>(null!)
  const g2 = useRef<THREE.Group>(null!)
  const g3 = useRef<THREE.Group>(null!)
  const shell = useRef<THREE.Mesh>(null!)
  const scanner = useRef<THREE.Mesh>(null!)
  const scanMat = useRef<THREE.MeshBasicMaterial>(null!)

  useFrame((state, dt) => {
    const p = scrollProgress()
    const hp = window.scrollY / window.innerHeight
    const t = state.clock.elapsedTime

    let tx: number, ty: number, ts: number
    // Rise, drift and shrink away as the hero scrolls out.
    tx = isMobile ? 0.6 : 2.4 + hp * 1.4
    ty = (isMobile ? 2.75 : 0.1) + hp * 2.4
    ts = Math.max(0, 1 - hp * 0.95) * (isMobile ? 0.42 : 1)
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, tx, 3, dt)
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, ty, 3, dt)
    const s = Math.max(0.0001, THREE.MathUtils.damp(group.current.scale.x, ts, 3, dt))
    group.current.scale.setScalar(s)
    group.current.visible = s > 0.01
    group.current.rotation.y = -0.4 + p * Math.PI * 1.5

    if (reduced) return
    g1.current.rotation.set(t * 0.35, 0, 0)
    g2.current.rotation.set(Math.PI / 2, t * 0.25, 0)
    g3.current.rotation.set(Math.PI / 3, Math.PI / 4, -t * 0.18)
    shell.current.rotation.set(t * 0.1, t * 0.14, 0)
    // scanner sweeps up and down the core
    const sy = Math.sin(t * 0.9) * 1.25
    scanner.current.position.y = sy
    const r = Math.sqrt(Math.max(0.02, 1.25 * 1.25 - sy * sy))
    scanner.current.scale.setScalar(r)
    scanMat.current.opacity = 0.35 + 0.35 * (1 - Math.abs(sy) / 1.25)
  })

  return (
    <group ref={group}>
      {/* metallic core */}
      <mesh>
        <sphereGeometry args={[0.72, 64, 64]} />
        <meshStandardMaterial color="#1e3f7a" metalness={0.65} roughness={0.28} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.74, 24, 16]} />
        <meshBasicMaterial color={C.ice} wireframe transparent opacity={0.12} />
      </mesh>
      {/* geodesic shell */}
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color={C.steel} wireframe transparent opacity={0.3} />
      </mesh>
      {/* scanner ring */}
      <mesh ref={scanner} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.97, 1, 96]} />
        <meshBasicMaterial ref={scanMat} color={C.blue} transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* gimbals */}
      <group ref={g1}>
        <GimbalRing radius={1.75} color={C.white} />
      </group>
      <group ref={g2}>
        <GimbalRing radius={2.1} color={C.blue} ticks={96} />
      </group>
      <group ref={g3}>
        <GimbalRing radius={2.5} color={C.steel} ticks={120} width={0.005} />
      </group>
      <Axes />
      <Electron radius={1.45} speed={1.3} tilt={[0.3, 0, 0.4]} color={C.ice} />
      <Electron radius={1.6} speed={-1} tilt={[-0.6, 0.4, 0]} color={C.white} />
      <Electron radius={2.3} speed={0.7} tilt={[1.1, 0, -0.3]} color={C.blue} />
    </group>
  )
}

/** Distant wireframe specimens. */
function Specimens() {
  const items = useMemo(
    () =>
      Array.from({ length: isMobile ? 3 : 7 }, (_, i) => ({
        pos: [(Math.random() - 0.5) * 24, (Math.random() - 0.5) * 12, -8 - Math.random() * 10] as [number, number, number],
        scale: 0.4 + Math.random() * 0.5,
        geo: i % 3,
        speed: 0.1 + Math.random() * 0.2,
      })),
    [],
  )
  const refs = useRef<THREE.Mesh[]>([])
  useFrame((_, dt) => {
    if (reduced) return
    refs.current.forEach((m, i) => {
      m.rotation.x += dt * items[i].speed
      m.rotation.y += dt * items[i].speed * 0.7
    })
  })
  return (
    <>
      {items.map((s, i) => (
        <mesh key={i} ref={(el) => void (el && (refs.current[i] = el))} position={s.pos} scale={s.scale}>
          {s.geo === 0 ? <octahedronGeometry /> : s.geo === 1 ? <boxGeometry /> : <dodecahedronGeometry />}
          <meshBasicMaterial color={C.steel} wireframe transparent opacity={0.1} />
        </mesh>
      ))}
    </>
  )
}

function CameraRig() {
  useFrame((state, dt) => {
    const { pointer, camera } = state
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.7, 2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.6 + pointer.y * 0.4, 2, dt)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function BackgroundScene() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      camera={{ position: [0, 0.6, 8], fov: 50 }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      eventSource={document.getElementById('root')!}
      eventPrefix="client"
    >
      <color attach="background" args={['#060a14']} />
      <fog attach="fog" args={['#060a14', 10, 34]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-4, -2, 3]} intensity={30} color={C.blue} />
      <pointLight position={[3, 3, -3]} intensity={18} color={C.ice} />
      <Grid
        position={[0, -3.2, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#13284d"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#1e3f7a"
        fadeDistance={34}
        fadeStrength={1.6}
      />
      <Dust />
      <Instrument />
      <Specimens />
      <CameraRig />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
