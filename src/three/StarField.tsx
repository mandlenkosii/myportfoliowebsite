import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const small = typeof window !== 'undefined' && window.innerWidth < 768

// Stars live in a box in front of the camera; y wraps so scrolling never runs out of sky.
const SPAN_X = 26
const SPAN_Y = 18
const NEAR = -2
const FAR = -16

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform float uSpanY;
  varying float vTwinkle;
  varying float vDepth;

  void main() {
    vec3 p = position;
    // depth 0 (far) … 1 (near): near stars move more on scroll = parallax
    float depth = clamp((p.z - ${FAR.toFixed(1)}) / (${NEAR.toFixed(1)} - ${FAR.toFixed(1)}), 0.0, 1.0);
    p.y += uScroll * mix(0.6, 2.6, depth) + uTime * 0.02;
    p.y = mod(p.y + uSpanY * 0.5, uSpanY) - uSpanY * 0.5;
    p.x += sin(uTime * 0.05 + aPhase) * 0.08;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (15.0 / -mv.z);

    vTwinkle = 0.45 + 0.55 * sin(uTime * aSpeed + aPhase);
    vDepth = depth;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  varying float vDepth;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // soft core with a faint glow
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.6);
    gl_FragColor = vec4(uColor, a * vTwinkle * mix(0.35, 1.0, vDepth) * uOpacity);
  }
`

function Stars({ dark }: { dark: boolean }) {
  const count = small ? 320 : 700
  const pixelRatio = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    const speed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * SPAN_X, (Math.random() - 0.5) * SPAN_Y, FAR + Math.random() * (NEAR - FAR)], i * 3)
      // mostly tiny stars, a few brighter ones
      size[i] = Math.random() < 0.08 ? 2.6 + Math.random() * 1.4 : 0.9 + Math.random() * 1.3
      phase[i] = Math.random() * Math.PI * 2
      speed[i] = 0.6 + Math.random() * 2.2
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    return g
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: 1 },
      uSpanY: { value: SPAN_Y },
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 1 },
    }),
    [],
  )

  // Smoothly follow the page scroll (in "screens") so the sky glides rather than jumps.
  const target = useRef(0)
  useEffect(() => {
    const onScroll = () => (target.current = window.scrollY / window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((state, dt) => {
    const u = uniforms
    u.uPixelRatio.value = pixelRatio
    u.uColor.value.set(dark ? '#e4e8ff' : '#3f3f46')
    u.uOpacity.value = dark ? 0.9 : 0.45
    if (!reduced) u.uTime.value = state.clock.elapsedTime
    u.uScroll.value = THREE.MathUtils.damp(u.uScroll.value, target.current, 6, dt)
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </points>
  )
}

/** An occasional streak across the sky. */
function ShootingStar({ dark }: { dark: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const s = useRef({ t: -1, next: 4 + Math.random() * 6, from: new THREE.Vector3(), dir: new THREE.Vector3() })

  useFrame((state, dt) => {
    if (reduced) return
    const st = s.current
    const now = state.clock.elapsedTime
    if (st.t < 0 && now > st.next) {
      st.t = 0
      st.from.set(-6 + Math.random() * 10, 3 + Math.random() * 3, -8)
      st.dir.set(1, -0.45 - Math.random() * 0.25, 0).normalize()
    }
    if (st.t >= 0) {
      st.t += dt
      const life = 1.1
      const k = st.t / life
      mesh.current.position.copy(st.from).addScaledVector(st.dir, k * 9)
      mesh.current.rotation.z = Math.atan2(st.dir.y, st.dir.x)
      mat.current.opacity = Math.sin(Math.min(k, 1) * Math.PI) * (dark ? 0.8 : 0.35)
      if (k >= 1) {
        st.t = -1
        st.next = now + 9 + Math.random() * 12
        mat.current.opacity = 0
      }
    }
  })

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1.4, 0.015]} />
      <meshBasicMaterial ref={mat} color={dark ? '#ffffff' : '#27272a'} transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default function StarField({ dark }: { dark: boolean }) {
  return (
    <Canvas
      aria-hidden
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      camera={{ position: [0, 0, 6], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
    >
      <Stars dark={dark} />
      {/* shooting stars read as light streaks, so only show them on the dark sky */}
      {dark && <ShootingStar dark={dark} />}
    </Canvas>
  )
}
