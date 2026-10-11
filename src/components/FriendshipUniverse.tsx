import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

function Constellation() {
  const group = useRef<THREE.Group>(null)
  const stars = useRef<THREE.InstancedMesh>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const ribbon = useMemo(() => new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-3.8, .65, 0),
    new THREE.Vector3(-.25, -1.2, -1.2),
    new THREE.Vector3(3.7, -.3, .2),
  ), [])
  const starPositions = useMemo(() => Array.from({ length: 180 }, (_, index) => {
    const angle = index * 2.399963
    const radius = Math.sqrt((index + .5) / 180)
    return {
      x: Math.cos(angle) * radius * 8.5,
      y: Math.sin(angle) * radius * 3.8,
      z: Math.sin(index * 12.31) * 2.3 - 1.8,
      scale: .45 + ((index * 37) % 11) / 13,
    }
  }), [])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - .5) * 2
      pointer.current.y = (event.clientY / window.innerHeight - .5) * 2
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    if (!stars.current) return
    const object = new THREE.Object3D()
    starPositions.forEach((position, index) => {
      object.position.set(position.x, position.y, position.z)
      object.scale.setScalar(position.scale)
      object.updateMatrix()
      stars.current?.setMatrixAt(index, object.matrix)
    })
    stars.current.instanceMatrix.needsUpdate = true
  }, [starPositions])

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * .075, 1.3, delta)
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.current.y * .055, 1.3, delta)
    }
    if (stars.current) stars.current.rotation.z += delta * .0015
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, 10.8, 1.3, delta)
  })

  return (
    <group ref={group}>
      <instancedMesh ref={stars} args={[undefined, undefined, starPositions.length]}>
        <sphereGeometry args={[.025, 5, 5]} />
        <meshBasicMaterial color="#e9d9f9" transparent opacity={.76} depthWrite={false} />
      </instancedMesh>
      <Sparkles count={75} scale={[12, 5.5, 5]} size={2.4} speed={.23} color="#f3d5a0" />
      <mesh>
        <tubeGeometry args={[ribbon, 80, .014, 6, false]} />
        <meshBasicMaterial color="#f4cf9b" transparent opacity={.65} />
      </mesh>
      <Float speed={1.1} floatIntensity={.22} rotationIntensity={.04}>
        <mesh position={[-3.8, .65, 0]}>
          <icosahedronGeometry args={[.11, 1]} />
          <meshBasicMaterial color="#fff1c8" />
        </mesh>
        <pointLight position={[-3.8, .65, 0]} color="#e6c78b" intensity={5} distance={2.2} />
      </Float>
      <Float speed={1.35} floatIntensity={.2} rotationIntensity={.05}>
        <mesh position={[3.7, -.3, .2]}>
          <icosahedronGeometry args={[.11, 1]} />
          <meshBasicMaterial color="#e1d1ff" />
        </mesh>
        <pointLight position={[3.7, -.3, .2]} color="#bca3e9" intensity={5} distance={2.2} />
      </Float>
    </group>
  )
}

export default function FriendshipUniverse() {
  return (
    <Canvas
      className="friendship-canvas"
      aria-hidden="true"
      camera={{ position: [0, 0, 11], fov: 49 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
    >
      <Constellation />
    </Canvas>
  )
}
