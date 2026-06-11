import { Environment, OrbitControls, Stage, Stats, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import DprManager from './components/DprManager'
import { Suspense, useState } from 'react'
import { RenderMetrics } from './components/RenderMetrics'
import CompoundCollider from './components/colliders/CompounCollider'

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
          camera={{ position: [5, 3, 5], fov: 45 }}
        >
          <RenderMetrics onUpdate={setMetrics} />
          <Stats showPanel={0} />
          <Stats showPanel={2} className="stats-memory" />
          <DprManager />
          <Environment preset="warehouse" resolution={256} environmentIntensity={0.6} />
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <CompoundCollider />
            <Stage
              adjustCamera={false}
              intensity={0.5}
              shadows="contact"
              environment={null}
            ></Stage>
          </Suspense>
          <OrbitControls enableDamping />
        </Canvas>
      </div>
    </main>
  )
}
useGLTF.preload('/modelos/Untitled.glb')
export default App
