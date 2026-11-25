import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const vertex = /* glsl */ `
  attribute float aRand;
  uniform float uTime;
  uniform float uExplode;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uHover;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    vec3 n = normalize(position);
    vec3 p = position;
    // slow breathing waves across the surface
    p += n * (sin(p.y * 3.0 + uTime * 1.2) * 0.035 + sin(p.x * 4.0 + p.z * 2.0 + uTime * 0.8) * 0.025);
    // click-to-scatter
    p += n * uExplode * (0.5 + aRand * 2.2);

    vec4 world = modelMatrix * vec4(p, 1.0);
    // cursor repulsion in world space
    float d = distance(world.xyz, uPointer);
    float push = smoothstep(0.75, 0.0, d) * uHover;
    world.xyz += normalize(world.xyz - uPointer + 0.0001) * push * 0.4;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + push * 1.6) / -mv.z;

    vAlpha = mix(0.18, 1.0, smoothstep(-1.4, 1.2, world.z));
    vAccent = clamp(step(0.94, aRand) + push * 1.5, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.25, r);
    gl_FragColor = vec4(mix(uColor, uAccent, vAccent), edge * vAlpha);
  }
`

function Particles({ dark }: { dark: boolean }) {
  const points = useRef<THREE.Points>(null!)
  const explodeTarget = useRef(0)
  const hoverTarget = useRef(0)
  const count = coarse ? 1400 : 2400

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const rand = new Float32Array(count)
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const t = golden * i
      pos.set([Math.cos(t) * r * 1.5, y * 1.5, Math.sin(t) * r * 1.5], i * 3)
      rand[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uExplode: { value: 0 },
      uSize: { value: coarse ? 22 : 26 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uHover: { value: 0 },
      uColor: { value: new THREE.Color() },
      uAccent: { value: new THREE.Color() },
    }),
    [],
  )

  useFrame((state, dt) => {
    const u = uniforms
    u.uColor.value.set(dark ? '#fafafa' : '#0a0a0a')
    u.uAccent.value.set(dark ? '#6b8cff' : '#2f5bea')
    if (!reduced) {
      u.uTime.value = state.clock.elapsedTime
      points.current.rotation.y += dt * 0.12
    }
    u.uExplode.value = THREE.MathUtils.damp(u.uExplode.value, explodeTarget.current, explodeTarget.current ? 5 : 2.2, dt)
    u.uHover.value = THREE.MathUtils.damp(u.uHover.value, hoverTarget.current, 6, dt)
  })

  const scatter = () => {
    if (reduced) return
    explodeTarget.current = 1
    window.setTimeout(() => (explodeTarget.current = 0), 380)
  }

  return (
    <group>
      <points ref={points} geometry={geometry}>
        <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
      </points>
      {/* invisible hit-sphere that feeds the cursor position to the shader */}
      <mesh
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          uniforms.uPointer.value.copy(e.point)
          hoverTarget.current = 1
        }}
        onPointerOut={() => (hoverTarget.current = 0)}
        onClick={scatter}
      >
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function Orb({ dark, active = true }: { dark: boolean; active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 4.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ cursor: 'grab', touchAction: 'pan-y' }}
      aria-label="Interactive particle sphere: drag to spin, click to scatter"
    >
      <Particles dark={dark} />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={!coarse} rotateSpeed={0.5} enableDamping />
    </Canvas>
  )
}
