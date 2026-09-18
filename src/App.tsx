import { Environment, OrbitControls, PerspectiveCamera, Stats, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import DprManager from './components/DprManager'
import { Suspense, useMemo } from 'react'
//import { RenderMetrics } from './components/RenderMetrics'
import CompoundCollider from './components/colliders/CompounCollider'
import { ConsoleGame } from './components/ConsoleGame'
import * as THREE from 'three'
import { BackgroundOnly } from './components/BackgroundOnly'
import { useGameStore } from './store/gameStore'
import { getTierSettings } from './utils/optimizationInitilizer'
import { OverlayInstructions } from './components/OverlayInstructions'
/*function Model() {
  const gltf = useGLTF('/modelos/Untitled.glb')
  return <primitive object={gltf.scene} scale={1} position={[0, 0, 0]} />
}*/
THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
  'vec3 CustomToneMapping( vec3 color ) { return color; }',
  `vec3 CustomToneMapping( vec3 color ) {
    vec3 mapped = ACESFilmicToneMapping( color );
    return mix( color, mapped, 0.6 ); // 80% curva, 20% crudo
  }`
)
useGLTF.preload('/modelos/base.glb')
useGLTF.preload('/modelos/ConvexMesh.glb')
useGLTF.preload('/modelos/cupula.glb')
useGLTF.preload('/modelos/plastics.glb')
const ENV_ROTATION = new THREE.Euler(
  THREE.MathUtils.degToRad(0),
  THREE.MathUtils.degToRad(0),
  THREE.MathUtils.degToRad(2),
  'YZX'
)

const BG_ROTATION = new THREE.Euler(
  THREE.MathUtils.degToRad(10),
  THREE.MathUtils.degToRad(72),
  THREE.MathUtils.degToRad(-5),
  'YZX'
)
function App() {
  /*const [metrics, setMetrics] = useState<{
    drawCalls?: number
    triangles?: number
    geometries?: number
    textures?: number
    shaders?: number
    vertices?: number
  }>({})*/
  const tier = useGameStore((state) => state.tier)
  const dpr = useGameStore((state) => state.dpr)
  const settings = useMemo(() => getTierSettings(dpr)[tier], [tier, dpr])
  const { resolution, samples, useTransmission } = settings
  return (
    <main className="grid h-screen w-screen overflow-hidden">
      <header className="flex justify-center">
        <h5>
          Iron Sea Rings resolution: {resolution}, samples: {samples}, tier: {tier}
          {useTransmission}
        </h5>
        <OverlayInstructions />
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
          {/*Object.entries(metrics).map(([k, v]) => (
            <div key={k}>
              {k}: {v}
            </div>
          ))*/}
        </div>
      </header>
      <div className="relative">
        <Canvas
          style={{ position: 'relative', inset: 0 }}
          gl={{
            antialias: false,
            stencil: false,
            depth: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.CustomToneMapping,
            toneMappingExposure: 1.2,
          }}
          camera={{ position: [0, 0, 0], rotation: [0, 0, 10] }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={60} />
            {/**
            new THREE.Euler(
              THREE.MathUtils.degToRad(278),
              THREE.MathUtils.degToRad(67),
              THREE.MathUtils.degToRad(-15),
              'YZX'
            )
            <RenderMetrics onUpdate={setMetrics} />
             */}

            <Stats showPanel={0} />
            <Stats showPanel={2} className="stats-memory" />
            {<DprManager />}
            <BackgroundOnly imageUrl="/modelos/equirect-background2.webp" />
            <Environment
              files="/hdri/lighthdri.hdr"
              resolution={128}
              environmentIntensity={0.8}
              //background
              environmentRotation={ENV_ROTATION}
              backgroundRotation={BG_ROTATION}
            />
            <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
              <CompoundCollider />
            </group>

            <group rotation={[0, -1.5, 0]} position={[0, -1.5, 0]}>
              <ConsoleGame />
            </group>

            <OrbitControls
              enableDamping
              // enablePan={false}
              minDistance={1.75}
              maxDistance={7}
              minAzimuthAngle={THREE.MathUtils.degToRad(-90)} // izquierda
              maxAzimuthAngle={THREE.MathUtils.degToRad(100)} // derecha
              minPolarAngle={THREE.MathUtils.degToRad(20)} // arriba
              maxPolarAngle={THREE.MathUtils.degToRad(120)} // abajo
            />
          </Suspense>
        </Canvas>
      </div>
    </main>
  )
}

/*function ShaderDebug() {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    // espera un poco para dar tiempo a que TODO termine de montar y compilar
    const id = setTimeout(() => {
      console.log('Programas de shader compilados:', gl.info.programs?.length)
      console.log('Detalle:', gl.info.programs)
    }, 3000) // ajusta este delay a más o menos lo que tarda tu carga completa

    return () => clearTimeout(id)
  }, [gl])

  return null
}*/
export default App
