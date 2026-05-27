import { Environment, OrbitControls, Stage, Stats, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import DprManager from './components/DprManager'
import { Suspense, useState } from 'react'
import { RenderMetrics } from './components/RenderMetrics'

function Model() {
  const gltf = useGLTF('/modelos/Untitled.glb')
  return <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
}
function App() {
  const [metrics, setMetrics] = useState({})
  return (
    <main className="grid h-screen overflow-hidden" style={{ gridTemplateRows: 'auto 1fr' }}>
      <header className="bg-bacgr">
        <h1>Utis toss game</h1>

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
          <Environment preset="warehouse" background resolution={256} environmentIntensity={0.6} />
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <Stage adjustCamera={true} intensity={0.5} shadows="contact" environment={null}>
              <Model />
            </Stage>
          </Suspense>
          <OrbitControls enableDamping />
        </Canvas>
      </div>
    </main>
  )
}
useGLTF.preload('/modelos/Untitled.glb')
export default App
