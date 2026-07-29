import { Environment, OrbitControls, Stats, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import DprManager from './components/DprManager'
import { Suspense, useState } from 'react'
import { RenderMetrics } from './components/RenderMetrics'
import CompoundCollider from './components/colliders/CompounCollider'
import { ConsoleGame } from './components/ConsoleGame'
import * as THREE from 'three'
/*function Model() {
  const gltf = useGLTF('/modelos/Untitled.glb')
  return <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
}*/

function App() {
  const [metrics, setMetrics] = useState<{
    drawCalls?: number
    triangles?: number
    geometries?: number
    textures?: number
    shaders?: number
    vertices?: number
  }>({})
  return (
    <main
      className="grid h-screen w-screen overflow-hidden"
      style={{ gridTemplateRows: 'auto 1fr' }}
    >
      <header className="flex justify-center">
        <h1>Iron Sea Rings</h1>

        <div
          style={{
            position: 'fixed',
            top: 60,
            right: 0,
            background: '#000',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 11,
            padding: '4px 8px',
            zIndex: 100,
          }}
        >
          {Object.entries(metrics).map(([k, v]) => (
            <div key={k}>
              {k}: {v}
            </div>
          ))}
        </div>
      </header>
      <div className="relative">
        <Canvas
          style={{ position: 'relative', inset: 0 }}
          gl={{
            antialias: false,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          {/**
            new THREE.Euler(
              THREE.MathUtils.degToRad(278),
              THREE.MathUtils.degToRad(67),
              THREE.MathUtils.degToRad(-15),
              'YZX'
            )
             */}
          <RenderMetrics onUpdate={setMetrics} />
          <Stats showPanel={0} />
          <Stats showPanel={2} className="stats-memory" />
          <DprManager />
          <Environment
            files="/hdri/lighthdri.hdr"
            //resolution={256}
            environmentIntensity={0.5}
            background
            environmentRotation={
              new THREE.Euler(
                THREE.MathUtils.degToRad(0),
                THREE.MathUtils.degToRad(195),
                THREE.MathUtils.degToRad(-5),
                'YZX'
              )
            }
            backgroundRotation={
              new THREE.Euler(
                THREE.MathUtils.degToRad(0),
                THREE.MathUtils.degToRad(195),
                THREE.MathUtils.degToRad(-5),
                'YZX'
              )
            }
          />
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <CompoundCollider />
            {/**
               *
              <Stage
                adjustCamera={false}
                intensity={0.5}
                shadows="contact"
                environment={null}
              ></Stage>
               */}
          </Suspense>
          <Suspense fallback={null}>
            //
            <ConsoleGame />
            {/*
              <Stage
                adjustCamera={false}
                intensity={0.5}
                shadows="contact"
                environment={null}
              ></Stage>
                */}
          </Suspense>
          <OrbitControls enableDamping />
        </Canvas>
      </div>
    </main>
  )
}
useGLTF.preload('/modelos/Untitled.glb')
export default App
