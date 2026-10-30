import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * DayNightLight — animates directional light based on session time.
 * Day (0-5 min): bright warm. Sunset (5-8 min): orange, dimmer. Night (8-10+ min): blue, dim.
 */

export function DayNightLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const startTime = useRef(Date.now())

  useFrame(() => {
    if (!lightRef.current || !ambientRef.current) return
    const minutes = (Date.now() - startTime.current) / 60000
    const t = Math.min(1, minutes / 10)

    let r, g, b, intensity, ambientIntensity
    if (t < 0.5) {
      // Day -> sunset
      const u = t / 0.5
      r = 1.0
      g = 0.95 - u * 0.3
      b = 0.85 - u * 0.5
      intensity = 1.2 - u * 0.3
      ambientIntensity = 0.5 - u * 0.1
    } else {
      // Sunset -> night
      const u = (t - 0.5) / 0.5
      r = 1.0 - u * 0.6
      g = 0.65 - u * 0.3
      b = 0.35 + u * 0.4
      intensity = 0.9 - u * 0.5
      ambientIntensity = 0.4 - u * 0.2
    }

    lightRef.current.color.setRGB(r, g, b)
    lightRef.current.intensity = intensity
    ambientRef.current.intensity = ambientIntensity
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight
        ref={lightRef}
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  )
}
