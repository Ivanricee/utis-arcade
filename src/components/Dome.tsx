import { MeshTransmissionMaterial, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'
export default function Dome() {
  const { nodes, materials } = useGLTF('/modelos/cupula.glb')

  useEffect(() => {
    Object.values(materials).forEach((mat) => {
      if (mat.normalMap) mat.normalScale.set(3, 3)
    })
  }, [materials])

  return (
    <group>
      {Object.entries(nodes).map(([name, node]) => {
        if (!node.isMesh) return null
        if (name === 'cupula_up') {
          return (
            <mesh
              key={name}
              geometry={node.geometry}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
            >
              <MeshTransmissionMaterial
                normalMap={node.material.normalMap}
                roughnessMap={node.material.roughnessMap}
                transmission={1}
                roughness={0.5}
                thickness={0.98}
                ior={1.2}
                chromaticAberration={0.5}
                anisotropy={2.2}
                distortion={0.8} //0.5
                distortionScale={0.5} //0.5
                temporalDistortion={0.3}
                clearcoat={0.2}
                attenuationColor="#ffffff"
                attenuationDistance={1}
                color="#f9fff4"
                samples={10}
                resolution={2048}
              />
            </mesh>
          )
        }
        return (
          <mesh
            key={name}
            geometry={node.geometry}
            material={materials[node.material.name]}
            material-side={THREE.FrontSide}
            renderOrder={-100}
            castShadow={false}
            position={node.position}
            rotation={node.rotation}
            scale={node.scale}
          />
        )
      })}
    </group>
  )
}
