import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const AXIS_VECTORS = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
} as const

const PLANE_DEFAULT_NORMAL = new THREE.Vector3(0, 0, 1) // normal default PlaneGeometry
const tempOffset = new THREE.Vector3() // reused each frame, no allocations
const EPSILON = 0.001 // umbral to stop recalculating

function backOut(t: number, overshoot = 1.7) {
  const c1 = overshoot
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

interface UsePushButtonOptions {
  scene: THREE.Object3D
  buttonName: string
  iconTexturePath: string
  onPress: () => void
  onRelease: () => void
  isBlocked?: () => boolean
  pushAxis?: 'x' | 'y' | 'z'
  pushDirection?: number
  pushDistance?: number
  buttonAnimSpeed?: number
  iconAnimSpeed?: number
  iconWidth?: number
  iconHeight?: number
  iconScaleHidden?: number
  iconScaleIdle?: number
}

export function usePushButton({
  scene,
  buttonName,
  iconTexturePath,
  onPress,
  onRelease,
  isBlocked,
  pushAxis = 'z',
  pushDirection = -1,
  pushDistance = 0.03,
  buttonAnimSpeed = 12,
  iconAnimSpeed = 8,
  iconWidth = 28,
  iconHeight = 30,
  iconScaleHidden = 0.6,
  iconScaleIdle = 1,
}: UsePushButtonOptions) {
  const pushTexture = useTexture(iconTexturePath)
  //z,x,y
  const LOCAL_OFFSET = new THREE.Vector3(-9, -1, -68)

  const buttonRef = useRef<THREE.Object3D | null>(null)
  const iconMeshRef = useRef<THREE.Mesh | null>(null)
  const iconMatRef = useRef<THREE.MeshBasicMaterial | null>(null)

  const originalPos = useRef(new THREE.Vector3())
  const pushAxisRef = useRef(AXIS_VECTORS[pushAxis].clone().multiplyScalar(pushDirection))
  const pressedRef = useRef(false)
  const pressAmount = useRef(0)
  const iconAnim = useRef(1)
  const settledRef = useRef(true) // start iddle: nothing to animate until first press

  useEffect(() => {
    pushAxisRef.current.copy(AXIS_VECTORS[pushAxis]).multiplyScalar(pushDirection)
  }, [pushAxis, pushDirection])

  useEffect(() => {
    const found = scene.getObjectByName(buttonName)
    if (!found) return

    buttonRef.current = found
    originalPos.current.copy(found.position)

    const geometry = new THREE.PlaneGeometry(iconWidth, iconHeight)
    const material = new THREE.MeshBasicMaterial({
      map: pushTexture,
      transparent: true,
      alphaTest: 0.4,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide, // por si la orientación calculada queda al revés
    })
    const iconMesh = new THREE.Mesh(geometry, material)
    iconMesh.name = 'push_icon'
    iconMesh.renderOrder = 999

    // visible face of button is opposite to where it hangs
    const outwardNormal = pushAxisRef.current.clone().negate().normalize()
    iconMesh.quaternion.setFromUnitVectors(PLANE_DEFAULT_NORMAL, outwardNormal)
    iconMesh.rotateZ(Math.PI / -2)
    iconMesh.position.copy(outwardNormal).multiplyScalar(10).add(LOCAL_OFFSET)

    iconMesh.raycast = () => {} //stop intercepting clicks

    found.add(iconMesh)
    iconMeshRef.current = iconMesh
    iconMatRef.current = material

    return () => {
      found.remove(iconMesh)
      geometry.dispose()
      material.dispose()
    }
  }, [scene, buttonName, pushTexture, iconWidth, iconHeight])

  // helper to release button regardless of where the pointer is released
  useEffect(() => {
    const forceRelease = () => {
      if (pressedRef.current) {
        pressedRef.current = false
        settledRef.current = false
        onRelease()
      }
    }
    window.addEventListener('pointerup', forceRelease)
    window.addEventListener('pointercancel', forceRelease)
    window.addEventListener('blur', forceRelease)
    return () => {
      window.removeEventListener('pointerup', forceRelease)
      window.removeEventListener('pointercancel', forceRelease)
      window.removeEventListener('blur', forceRelease)
    }
  }, [onRelease])

  useFrame((_, delta) => {
    // si ya llegamos al valor objetivo en ambas animaciones, no calcules nada este frame
    if (settledRef.current) return

    const btn = buttonRef.current
    if (!btn) return

    const targetPress = pressedRef.current ? 1 : 0
    pressAmount.current = THREE.MathUtils.damp(
      pressAmount.current,
      targetPress,
      buttonAnimSpeed,
      delta
    )
    tempOffset.copy(pushAxisRef.current).multiplyScalar(pushDistance * pressAmount.current)
    btn.position.copy(originalPos.current).add(tempOffset)

    const targetIcon = pressedRef.current ? 0 : 1
    iconAnim.current = THREE.MathUtils.damp(iconAnim.current, targetIcon, iconAnimSpeed, delta)

    const iconMesh = iconMeshRef.current
    const iconMat = iconMatRef.current
    if (iconMesh && iconMat) {
      const t = THREE.MathUtils.clamp(iconAnim.current, 0, 1)
      const eased = backOut(t)
      iconMesh.scale.setScalar(THREE.MathUtils.lerp(iconScaleHidden, iconScaleIdle, eased))
      iconMat.opacity = t * t * (3 - 2 * t)
    }

    // marca "en reposo" cuando ambas animaciones ya llegaron a su objetivo
    const pressDone = Math.abs(pressAmount.current - targetPress) < EPSILON
    const iconDone = Math.abs(iconAnim.current - targetIcon) < EPSILON
    if (pressDone && iconDone) settledRef.current = true
  })

  const wake = () => {
    settledRef.current = false
  } // reactivate useFrame when pressing/releasing

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.name !== buttonName) return
    if (isBlocked?.()) return
    pressedRef.current = true
    wake()
    onPress()
  }
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.name !== buttonName) return
    pressedRef.current = false
    wake()
    onRelease()
  }
  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    if (e.object.name !== buttonName) return
    if (pressedRef.current) {
      pressedRef.current = false
      wake()
      onRelease()
    }
  }

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: handlePointerLeave,
  }
}
