# Tutorial Completo de Rapier para React Three Fiber v9

## 📚 Índice

1. [FASE 1: Fundamentos](#fase-1-fundamentos)
2. [FASE 2: Proyecto Water Ring Toss](#fase-2-water-ring-toss)
3. [Referencia Rápida](#referencia-rápida)
4. [Optimización para Móviles](#optimización-para-móviles)

---

## FASE 1: Fundamentos

### Archivos Disponibles

- **`src/tutorials/01-fundamentos-rapier.tsx`** - 9 ejemplos mínimos y funcionales

### Conceptos Cubiertos

#### 1. Instalación y Setup Básico
```bash
npm install @react-three/rapier rapier3d
```

Setup mínimo:
```tsx
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'

<Canvas>
  <Physics gravity={[0, -9.81, 0]}>
    <RigidBody position={[0, 5, 0]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  </Physics>
</Canvas>
```

#### 2. Tipos de RigidBody

| Tipo | Cuándo Usar | Ejemplo |
|------|-------------|---------|
| `dynamic` (default) | Objetos que caen, rebotan, son empujados | Pelotas, cajas |
| `fixed` | Objetos completamente estáticos | Suelo, paredes |
| `kinematicPosition` | Movimiento manual por código | Plataformas móviles |
| `kinematicVelocity` | Movimiento continuo suave | Cintas transportadoras |

**Ejemplo kinematicPosition:**
```tsx
function BloqueKinematic() {
  const ref = useRef<RapierRigidBody>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const y = 2 + Math.sin(state.clock.elapsedTime) * 1.5
      // IMPORTANTE: Usar setNextKinematicTranslation, NO modificar posición directa
      ref.current.setNextKinematicTranslation({ x: 0, y, z: 0 })
    }
  })

  return (
    <RigidBody ref={ref} type="kinematicPosition" position={[0, 2, 0]}>
      <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="green" /></mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  )
}
```

#### 3. Tipos de Colliders (Orden de Rendimiento)

| Collider | Rendimiento | Uso Recomendado |
|----------|-------------|-----------------|
| `CuboidCollider` | ⭐⭐⭐ Máximo | Cajas, paredes, suelos |
| `SphereCollider` | ⭐⭐⭐ Máximo | Pelotas, rodillos |
| `CylinderCollider` | ⭐⭐ Alto | Columnas, postes |
| `CapsuleCollider` | ⭐⭐ Alto | Personajes |
| `Compound` | ⭐⭐ Alto (depende) | Objetos complejos |
| `TrimeshCollider` | ⚠️ Bajo | SOLO fixed estáticos |

**⚠️ NUNCA usar TrimeshCollider en objetos dynamic o kinematic**

**Ejemplo Compound Collider (Aro):**
```tsx
function AroCompound() {
  const radius = 0.5
  const sphereRadius = 0.15
  const segments = 8
  
  return (
    <RigidBody position={[2, 3, 0]} restitution={0.8}>
      {/* Visual */}
      <mesh><torusGeometry args={[radius, sphereRadius, 8, segments]} /><meshStandardMaterial color="gold" /></mesh>
      
      {/* Compound: 8 esferas formando anillo */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return <SphereCollider key={i} args={[sphereRadius]} position={[x, y, 0]} />
      })}
    </RigidBody>
  )
}
```

#### 4. Props de `<Physics>`

```tsx
<Physics 
  gravity={[0, -9.81, 0]}           // Vector gravedad
  timeStep={1/60}                    // Paso de tiempo (default: 60 FPS)
  iterations={{                      // Iteraciones de simulación
    velocity: 4,     // Reducir a 2-3 para móviles
    position: 4,
    contact: 4
  }}
  debug={false}                      // true para ver colliders
  worldAutoPause={true}              // Pausar cuando no está visible
>
```

#### 5. Hook useRapier()

```tsx
function CuboConImpulso() {
  const ref = useRef<RapierRigidBody>(null)
  const { rapier, world } = useRapier()
  
  const aplicarImpulso = () => {
    if (ref.current) {
      // Aplicar impulso
      ref.current.applyImpulse({ x: 0, y: 5, z: 2 }, true)
    }
  }
  
  return (
    <RigidBody ref={ref} position={[0, 2, 0]}>
      <mesh onClick={aplicarImpulso}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="orange" /></mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  )
}
```

#### 6. CCD (Continuous Collision Detection)

**¿Cuándo usar CCD?**
- Objetos muy rápidos (balas, proyectiles)
- Objetos que caen desde gran altura
- Objetos pequeños que pueden atravesar otros

```tsx
// SIN CCD - puede atravesar objetos
<RigidBody position={[0, 20, 0]}>
  <SphereCollider args={[0.3]} />
</RigidBody>

// CON CCD - siempre detecta colisión
<RigidBody position={[0, 20, 0]} ccd={true}>
  <SphereCollider args={[0.3]} />
</RigidBody>
```

**⚠️ CCD es más costoso, usar solo cuando sea necesario**

#### 7. Mover Kinematic desde useFrame

**Patrón CORRECTO:**
```tsx
useFrame((state) => {
  if (ref.current) {
    const x = Math.sin(state.clock.elapsedTime * 2) * 3
    ref.current.setNextKinematicTranslation({ x, y: 0.5, z: 0 })
  }
})
```

**❌ INCORRECTO (no funciona):**
```tsx
useFrame((state) => {
  // ESTO NO FUNCIONA con kinematic
  ref.current.translation().x = Math.sin(state.clock.elapsedTime)
})
```

#### 8. Cambiar Gravedad Dinámicamente

```tsx
function GravedadDinamica() {
  const [gravity, setGravity] = useState<[number, number, number]>([0, -9.81, 0])
  
  return (
    <>
      <button onClick={() => setGravity([0, 0, 0])}>Gravedad Cero</button>
      <button onClick={() => setGravity([0, 9.81, 0])}>Invertida</button>
      
      <Physics gravity={gravity}>
        {/* ... cuerpos físicos */}
      </Physics>
    </>
  )
}
```

#### 9. Sensors para Detección de Colisiones

```tsx
function ZonaDePuntos({ onPunto }: { onPunto: () => void }) {
  return (
    <RigidBody type="fixed" position={[0, 1.5, 0]}>
      {/* Visual */}
      <mesh><torusGeometry args={[0.8, 0.1, 8, 16]} /><meshStandardMaterial color="gold" transparent opacity={0.5} /></mesh>
      
      {/* Sensor invisible */}
      <CuboidCollider 
        args={[0.9, 0.2, 0.9]} 
        sensor={true}
        onIntersectionEnter={({ other }) => {
          console.log('Objeto entró:', other.rigidBodyObject)
          onPunto()
        }}
      />
    </RigidBody>
  )
}
```

**Props de eventos:**
- `onIntersectionEnter` - Algo entró en el sensor
- `onIntersectionExit` - Algo salió del sensor
- `onCollisionEnter` - Colisión física (solo non-sensor)
- `onCollisionExit` - Fin de colisión física

---

## FASE 2: Water Ring Toss

### Archivo Principal
- **`src/tutorials/02-water-ring-toss.tsx`** - Implementación completa del juego

### Arquitectura del Proyecto

```
WaterRingTossGame (Componente Principal)
├── BotonJugar (Solicita permisos iOS)
├── Canvas (R3F)
│   ├── Environment (Iluminación HDRI)
│   ├── ContactShadows (Sombras optimizadas)
│   ├── EscenaJuego
│   │   ├── Contenedor (kinematicPosition + compound colliders)
│   │   ├── Aros ×3 (dynamic + CCD + compound spheres)
│   │   ├── BloquesAnimados ×2 (kinematicPosition)
│   │   ├── Targets ×5 (fixed + sensors)
│   │   └── Suelo (fixed)
│   ├── EffectComposer
│   │   ├── Bloom
│   │   └── SMAA
│   └── Stats (Debug)
└── HUD (Score + Tiempo)
```

### Paso a Paso de Implementación

#### Paso 1: Escena Estática con GLB

```tsx
function ModeloGLB({ url }: { url: string }) {
  const { nodes, materials } = useGLTF(url)
  
  // Ver nodos disponibles (debug)
  useEffect(() => {
    console.log('Nodos:', Object.keys(nodes))
  }, [nodes])
  
  return <group dispose={null}>{/* ... nodos */}</group>
}
```

**Convención de nombres desde Blender:**
- `Capsule_Wall_Left`, `Capsule_Wall_Right`, `Capsule_Floor` → fixed
- `Block_Animated_01`, `Block_Animated_02` → kinematicPosition
- `Ring` → dynamic con CCD
- `Decoration_Static_XX` → sin física

#### Paso 2: Físicas Básicas

**Contenedor tipo cápsula (compound de cuboids):**
```tsx
function ContenedorCapsula() {
  return (
    <RigidBody type="kinematicPosition" position={[0, 1.5, 0]}>
      {/* 4 paredes + suelo como CuboidColliders */}
      <CuboidCollider args={[0.1, 1.5, 2]} position={[-2.1, 0, 0]} />
      <CuboidCollider args={[0.1, 1.5, 2]} position={[2.1, 0, 0]} />
      <CuboidCollider args={[2, 1.5, 0.1]} position={[0, 0, -2.1]} />
      <CuboidCollider args={[2, 1.5, 0.1]} position={[0, 0, 2.1]} />
      <CuboidCollider args={[2, 0.1, 2]} position={[0, -1.6, 0]} />
    </RigidBody>
  )
}
```

**¿Por qué NO trimesh?**
- Trimesh no permite colisiones internas
- Los aros no podrían rebotar DENTRO del contenedor
- Trimesh es 10x más lento que compound de primitivas

#### Paso 3: Bloques Kinematic Animados

```tsx
function BloqueAnimado({ position, amplitude = 1.5, speed = 2 }) {
  const ref = useRef<RapierRigidBody>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime * speed
      const yOffset = Math.sin(time) * amplitude
      ref.current.setNextKinematicTranslation({
        x: position[0],
        y: position[1] + yOffset,
        z: position[2],
      })
    }
  })
  
  return (
    <RigidBody ref={ref} type="kinematicPosition" position={position}>
      <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#ff6b6b" /></mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  )
}
```

**¿Por qué kinematicPosition y NO useAnimations?**
- `useAnimations` de drei no interactúa correctamente con físicas
- Los bloques deben EMPUJAR los aros, no ser empujados por ellos
- kinematicPosition da control total del movimiento

#### Paso 4: Rotación Unificada Móvil/PC

**Hook personalizado para controles:**
```tsx
function useRotationControl(enabled: boolean) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const targetRotation = useRef({ x: 0, y: 0, z: 0 })
  
  // PC: mouse drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRotation.current.y += deltaX * 0.01
      targetRotation.current.x += deltaY * 0.01
    }
    window.addEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Móvil: giroscopio
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      targetRotation.current.z = (e.gamma || 0) * (Math.PI / 180)
      targetRotation.current.x = (e.beta || 0) * (Math.PI / 180)
    }
    window.addEventListener('deviceorientation', handleDeviceOrientation)
  }, [])
  
  // Interpolación suave
  useFrame(() => {
    setRotation(prev => ({
      x: THREE.MathUtils.lerp(prev.x, targetRotation.current.x, 0.1),
      y: THREE.MathUtils.lerp(prev.y, targetRotation.current.y, 0.1),
      z: THREE.MathUtils.lerp(prev.z, targetRotation.current.z, 0.1),
    }))
  })
  
  return rotation
}
```

**Calcular gravedad basada en rotación:**
```tsx
function calcularGravedadParaRotacion(rotation) {
  const gravity = new THREE.Vector3(0, -9.81, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromEuler(new THREE.Euler(-rotation.x, -rotation.y, -rotation.z))
  gravity.applyQuaternion(quaternion)
  return [gravity.x, gravity.y, gravity.z]
}
```

#### Paso 5: Agitación con Acelerómetro

**Detección de shake:**
```tsx
function useShakeDetection(onShake: (intensity: number) => void) {
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 })
  const shakeThreshold = 15
  
  useEffect(() => {
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      
      const deltaAcc = Math.sqrt(
        Math.pow(acc.x - lastAcceleration.current.x, 2) +
        Math.pow(acc.y - lastAcceleration.current.y, 2) +
        Math.pow(acc.z - lastAcceleration.current.z, 2)
      )
      
      if (deltaAcc > shakeThreshold) {
        onShake(deltaAcc)
      }
      lastAcceleration.current = { x: acc.x, y: acc.y, z: acc.z }
    }
    
    window.addEventListener('devicemotion', handleDeviceMotion)
  }, [onShake])
}
```

**Permisos en iOS:**
```tsx
async function solicitarPermisosSensores(): Promise<boolean> {
  const deviceOrientationAny = DeviceOrientationEvent as any
  
  if (typeof deviceOrientationAny.requestPermission === 'function') {
    const permission = await deviceOrientationAny.requestPermission()
    return permission === 'granted'
  }
  
  return true // Android no requiere permiso explícito
}
```

#### Paso 6: Detección de Targets y Victoria

**Zona target con sensor:**
```tsx
function ZonaTarget({ target, onAtrapado }) {
  const alreadyScored = useRef<Set<string>>(new Set())
  
  return (
    <RigidBody type="fixed" position={target.position}>
      {/* Visual */}
      <mesh><torusGeometry args={[0.6, 0.05, 8, 16]} /><meshStandardMaterial color={target.color} emissive={target.color} /></mesh>
      
      {/* Sensor */}
      <CuboidCollider
        args={[0.7, 0.2, 0.7]}
        sensor={true}
        onIntersectionEnter={({ other }) => {
          const aroId = other.rigidBodyObject?.uuid
          if (aroId && !alreadyScored.current.has(aroId)) {
            alreadyScored.current.add(aroId)
            onAtrapado(target.id, target.points)
          }
        }}
      />
    </RigidBody>
  )
}
```

**Gestión de estado del juego:**
```tsx
function useGameState() {
  const [gameState, setGameState] = useState({
    score: 0,
    startTime: null,
    completed: false,
    targetsHit: [],
  })
  
  const addPoints = useCallback((targetId: string, points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      targetsHit: [...prev.targetsHit, targetId],
      completed: prev.targetsHit.length >= 5,
    }))
  }, [])
  
  return { gameState, addPoints }
}
```

---

## Referencia Rápida

### Imports Necesarios

```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Physics, 
  RigidBody, 
  CuboidCollider, 
  SphereCollider, 
  CapsuleCollider,
  CylinderCollider,
  useRapier,
  RapierRigidBody 
} from '@react-three/rapier'
import { useGLTF, ContactShadows, Environment, Stats } from '@react-three/drei'
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'
```

### Configuración Óptima para Móviles

```tsx
<Canvas
  dpr={[1, 1.5]}  // DPI dinámico (1x a 1.5x)
  gl={{
    antialias: false,  // Usar SMAA en post-processing
    powerPreference: 'high-performance',
    stencil: false,
  }}
>
  <Physics
    gravity={[0, -9.81, 0]}
    timeStep={1/60}
    iterations={{ velocity: 3, position: 3, contact: 3 }}  // Reducido para móvil
  >
    {/* ... escena */}
  </Physics>
  
  <EffectComposer disableNormalPass>
    <Bloom luminanceThreshold={0.8} intensity={0.5} />
    <SMAA />  // Anti-aliasing eficiente
  </EffectComposer>
</Canvas>
```

### Checklist de Rendimiento

- ✅ Cero TrimeshColliders en objetos dynamic/kinematic
- ✅ Usar compound colliders en lugar de mallas complejas
- ✅ CCD solo en objetos rápidos (aros)
- ✅ Sleeping automático activado (default en Rapier)
- ✅ Máximo ~20 cuerpos físicos activos
- ✅ Texturas comprimidas en KTX2
- ✅ DPR dinámico `[1, 1.5]`
- ✅ Iteraciones reducidas en móviles (3 vs 4)
- ✅ ContactShadows en lugar de sombras completas
- ✅ SMAA en lugar de MSAA

---

## Preguntas Frecuentes

### ¿Por qué mi objeto kinematic no se mueve?

**Error común:**
```tsx
// ❌ INCORRECTO
ref.current.translation().x = 5

// ✅ CORRECTO
ref.current.setNextKinematicTranslation({ x: 5, y: 0, z: 0 })
```

### ¿Por qué los aros atraviesan las paredes?

1. Activar CCD: `<RigidBody ccd={true}>`
2. Aumentar iterations en Physics
3. Reducir timeStep si caen desde muy alto

### ¿Cómo depurar colliders?

```tsx
<Physics debug={true}>  // Muestra wireframes de todos los colliders
```

### ¿Los sensores afectan la física?

No, los sensores (`sensor={true}`) detectan colisiones pero no generan respuesta física. Los objetos los atraviesan.

---

## Recursos Adicionales

- [Documentación oficial de Rapier](https://rapier.rs/docs/)
- [@react-three/rapier GitHub](https://github.com/pmndrs/react-three-rapier)
- [Ejemplos de Drei](https://github.com/pmndrs/drei)
