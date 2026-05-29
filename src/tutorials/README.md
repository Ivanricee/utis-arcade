# Tutorial Completo de Rapier para React Three Fiber

## 📚 Índice

1. [FASE 1: Fundamentos](#fase-1-fundamentos)
2. [FASE 2: Proyecto Water Ring Toss](#fase-2-water-ring-toss)
3. [Referencia Rápida](#referencia-rápida)
4. [Optimización para Móviles](#optimización-para-móviles)

---

## FASE 1: Fundamentos

### Archivos Disponibles

- **`src/tutorials/01-fundamentos-rapier.tsx`** — 9 ejemplos mínimos y funcionales

### Conceptos Cubiertos

#### 1. Instalación y Setup Básico

```bash
npm install @react-three/rapier
```

> **Nota:** No necesitas instalar `rapier3d` por separado. `@react-three/rapier` ya incluye `@dimforge/rapier3d-compat` como dependencia interna.

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

Todo objeto físico en Rapier necesita un tipo que define cómo se comporta ante las fuerzas del mundo.

| Tipo                | Cuándo Usar                                      | Ejemplo                                    |
| ------------------- | ------------------------------------------------ | ------------------------------------------ |
| `dynamic` (default) | Objetos que caen, rebotan, son empujados         | Pelotas, cajas                             |
| `fixed`             | Objetos completamente estáticos, nunca se mueven | Suelo, paredes                             |
| `kinematicPosition` | Movimiento manual por código, posición absoluta  | Plataformas móviles                        |
| `kinematicVelocity` | Movimiento continuo definiendo velocidad         | Cintas transportadoras, rotación constante |

**¿Cuál es la diferencia entre `kinematicPosition` y `kinematicVelocity`?**

- `kinematicPosition` le dices _"quiero que estés en esta posición exacta"_ en cada frame. Tú calculas la posición.
- `kinematicVelocity` le dices _"muévete a esta velocidad"_ y Rapier calcula la posición resultante. Más natural para movimientos continuos.

**Ejemplo kinematicPosition (plataforma oscilante):**

```tsx
function PlataformaOscilante() {
  const ref = useRef<RapierRigidBody>(null)

  useFrame((state) => {
    if (ref.current) {
      const y = 2 + Math.sin(state.clock.elapsedTime) * 1.5
      // IMPORTANTE: Usar setNextKinematicTranslation, NO modificar posición directa
      // Rapier necesita este método para sincronizar la física correctamente
      ref.current.setNextKinematicTranslation({ x: 0, y, z: 0 })
    }
  })

  return (
    <RigidBody ref={ref} type="kinematicPosition" position={[0, 2, 0]}>
      <mesh>
        <boxGeometry args={[3, 0.3, 3]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <CuboidCollider args={[1.5, 0.15, 1.5]} />
    </RigidBody>
  )
}
```

**Ejemplo kinematicVelocity (objeto que rota constantemente):**

```tsx
function RodilloRotante() {
  const ref = useRef<RapierRigidBody>(null)

  useFrame(() => {
    if (ref.current) {
      // Definimos velocidad angular en lugar de calcular posición
      ref.current.setNextKinematicRotation(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, performance.now() * 0.001, 0)
        )
      )
    }
  })

  return (
    <RigidBody ref={ref} type="kinematicPosition">
      <mesh><cylinderGeometry args={[1, 1, 0.5, 16]} /><meshStandardMaterial color="steelblue" /></mesh>
      <CylinderCollider args={[0.25, 1]} />
    </RigidBody>
  )
}
```

#### 3. Tipos de Colliders (Orden de Rendimiento)

Los colliders son las **formas invisibles** que Rapier usa para detectar colisiones. La malla visual que el usuario ve es independiente del collider. Siempre prefiere formas primitivas sobre mallas exactas.

| Collider                     | Rendimiento                    | Uso Recomendado                |
| ---------------------------- | ------------------------------ | ------------------------------ |
| `CuboidCollider`             | ⭐⭐⭐ Máximo                  | Cajas, paredes, suelos         |
| `SphereCollider`             | ⭐⭐⭐ Máximo                  | Pelotas, rodillos              |
| `CylinderCollider`           | ⭐⭐ Alto                      | Columnas, postes               |
| `CapsuleCollider`            | ⭐⭐ Alto                      | Personajes                     |
| Compound (varias primitivas) | ⭐⭐ Alto (depende del número) | Objetos complejos              |
| `TrimeshCollider`            | ⚠️ Bajo                        | SOLO objetos `fixed` estáticos |

**⚠️ NUNCA usar TrimeshCollider en objetos `dynamic` o `kinematic`**

Trimesh genera una malla de triángulos exacta de la geometría, lo que es extremadamente costoso para la simulación en tiempo real. Además, Rapier no soporta colisiones desde el interior de un TrimeshCollider (un objeto dentro de una caja trimesh la atravesaría hacia afuera). Siempre reemplázalo con compound colliders.

---

**Compound Collider: el caso del aro (torus)**

Rapier no tiene un collider de tipo toro nativo. No existe `TorusCollider`. Si pones un `<RigidBody>` con una `torusGeometry` sin especificar collider explícito, Rapier intentará auto-generar uno con trimesh, lo que daría muy mal rendimiento y comportamiento incorrecto en un objeto dinámico.

La solución es aproximar el anillo con múltiples esferas pequeñas distribuidas en círculo, formando un collider compuesto (_compound collider_). Cuantas más esferas, más precisa la aproximación pero mayor el coste. 8 esferas es un buen balance.

```tsx
function AroCompound() {
  const radius = 0.5      // Radio del aro (centro al centro del tubo)
  const tubeRadius = 0.15 // Grosor del tubo
  const segments = 8      // Número de esferas que forman el anillo

  return (
    <RigidBody position={[2, 3, 0]} restitution={0.8}>
      {/* Malla visual: el toro que el usuario ve */}
      <mesh>
        <torusGeometry args={[radius, tubeRadius, 8, segments]} />
        <meshStandardMaterial color="gold" />
      </mesh>

      {/* Compound collider: 8 esferas formando el anillo físico invisible */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        // Cada esfera se posiciona en su punto del círculo
        return <SphereCollider key={i} args={[tubeRadius]} position={[x, y, 0]} />
      })}
    </RigidBody>
  )
}
```

#### 4. Props de `<Physics>`

**⚠️ API CORREGIDA** — El prop `iterations` con objeto `{ velocity, position, contact }` **no existe** en versiones recientes de `@react-three/rapier`. Los props correctos son `numSolverIterations` y `numInternalPgsIterations`. Tampoco existe `worldAutoPause`; el prop correcto es `paused`.

```tsx
<Physics
  gravity={[0, -9.81, 0]}      // Vector gravedad. [0,0,0] = gravedad cero
  timeStep={1/60}               // Paso de tiempo fijo. "vary" para sincronizar con framerate

  // Iteraciones del solver (controlan precisión vs rendimiento)
  numSolverIterations={4}       // Default: 4. Reducir a 2-3 en móviles
  numInternalPgsIterations={1}  // Default: 1. Iteraciones PGS internas por paso de solver

  paused={false}                // true para pausar la simulación
  interpolate={true}            // Suaviza el movimiento entre pasos de física (recomendado: true)
  debug={false}                 // true para ver wireframes de todos los colliders (muy útil al desarrollar)
>
```

**¿Cuándo ajustar `numSolverIterations`?**

- **Más alto (6-8):** Simulaciones que necesitan máxima precisión: objetos apilados, resortes, articulaciones.
- **Default (4):** La mayoría de juegos.
- **Más bajo (2-3):** Móviles o escenas con muchos cuerpos donde la precisión exacta no es crítica.

**`timeStep: "vary"` vs número fijo:**

Con número fijo (ej. `1/60`), la física siempre simula a 60 FPS independientemente del framerate real. Con `"vary"`, la física se sincroniza con el delta del frame. El modo `"vary"` puede causar inestabilidad en frames muy largos, pero es más fluido visualmente. Para juegos competitivos o deterministas, usa número fijo.

#### 5. Hook useRapier()

`useRapier()` da acceso directo al mundo de física subyacente de Rapier. Útil para operaciones avanzadas que `<RigidBody>` no expone directamente.

```tsx
import { useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'

function CuboConImpulso() {
  const ref = useRef<RapierRigidBody>(null)

  const aplicarImpulso = () => {
    if (ref.current) {
      ref.current.applyImpulse({ x: 0, y: 5, z: 2 }, true)
      // true = wake up el cuerpo si está dormido (sleeping)
    }
  }

  return (
    <RigidBody ref={ref} position={[0, 2, 0]}>
      <mesh onClick={aplicarImpulso}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  )
}
```

**Caso de uso avanzado: raycast con `world`**

Aquí es donde `useRapier()` realmente brilla. Por ejemplo, disparar un rayo para detectar qué hay debajo del cursor:

```tsx
function RaycastExample() {
  const { rapier, world } = useRapier()

  const disparar = () => {
    const ray = new rapier.Ray(
      { x: 0, y: 10, z: 0 },  // origen
      { x: 0, y: -1, z: 0 }   // dirección (hacia abajo)
    )

    const hit = world.castRay(ray, 100, true) // maxToi, solid

    if (hit) {
      const punto = ray.pointAt(hit.timeOfImpact)
      console.log('Impacto en:', punto)
      // hit.collider → el collider golpeado
      // hit.timeOfImpact → distancia normalizada al impacto
    }
  }

  return <mesh onClick={disparar}>{/* ... */}</mesh>
}
```

#### 6. CCD (Continuous Collision Detection)

Por defecto, Rapier usa **detección discreta de colisiones**: comprueba colisiones en cada paso de física. Si un objeto se mueve muy rápido, puede "teletransportarse" de un lado al otro de una pared fina sin que Rapier detecte la colisión. A esto se le llama _tunneling_.

CCD resuelve esto subdividiendo el movimiento y comprobando continuamente a lo largo del trayecto.

```tsx
// SIN CCD — puede atravesar objetos si va muy rápido o cae desde muy alto
<RigidBody position={[0, 20, 0]}>
  <SphereCollider args={[0.3]} />
</RigidBody>

// CON CCD — siempre detecta la colisión aunque el objeto vaya muy rápido
<RigidBody position={[0, 20, 0]} ccd={true}>
  <SphereCollider args={[0.3]} />
</RigidBody>
```

**¿Cuándo activar CCD?**

- Objetos que caen desde gran altura (los aros del juego)
- Proyectiles, balas, o cualquier objeto que se mueva rápido
- Objetos pequeños que pueden pasar entre dos colliders

**⚠️ CCD tiene un coste de rendimiento.** No lo actives en todos los objetos, solo en los que realmente puedan tener tunneling.

#### 7. Mover Kinematic desde useFrame

Este es uno de los errores más comunes al empezar con Rapier.

**Patrón CORRECTO:**

```tsx
useFrame((state) => {
  if (ref.current) {
    const x = Math.sin(state.clock.elapsedTime * 2) * 3
    // Debes usar setNextKinematicTranslation para que Rapier
    // pueda calcular la velocidad implícita del objeto y aplicarla
    // correctamente a los cuerpos dinámicos con los que colisiona
    ref.current.setNextKinematicTranslation({ x, y: 0.5, z: 0 })
  }
})
```

**❌ INCORRECTO (no funciona ni genera error, simplemente se ignora):**

```tsx
useFrame((state) => {
  // Esto modifica la representación Three.js del objeto,
  // pero NO actualiza el mundo de física de Rapier.
  // El collider físico se queda quieto aunque la malla se mueva.
  ref.current.translation().x = Math.sin(state.clock.elapsedTime)
})
```

La razón es que Rapier y Three.js son dos mundos separados. Rapier tiene su propio estado interno del mundo físico. `setNextKinematicTranslation` le indica a Rapier la posición deseada para el próximo paso, y Rapier sincroniza Three.js como consecuencia. Si modificas Three.js directamente, Rapier no se entera.

#### 8. Cambiar Gravedad Dinámicamente

La gravedad en `<Physics>` es reactiva: si cambias el valor del prop, la física responde inmediatamente. Esto permite simular gravedad cero, gravedad inversa, o rotación del mundo.

```tsx
function GravedadDinamica() {
  const [gravity, setGravity] = useState<[number, number, number]>([0, -9.81, 0])

  return (
    <>
      <button onClick={() => setGravity([0, 0, 0])}>Gravedad Cero</button>
      <button onClick={() => setGravity([0, 9.81, 0])}>Gravedad Invertida</button>
      <button onClick={() => setGravity([0, -9.81, 0])}>Normal</button>

      <Physics gravity={gravity}>
        {/* Los cuerpos responden inmediatamente al cambio */}
      </Physics>
    </>
  )
}
```

> **Tip:** Para simular inclinar un contenedor (como en el Water Ring Toss), en lugar de rotar los objetos físicos, es más eficiente **rotar el vector de gravedad**. Ver Fase 2, Paso 4.

#### 9. Sensors para Detección de Colisiones

Un sensor es un collider especial que **detecta cuando algo lo toca, pero no genera respuesta física**. Los objetos dinámicos lo atraviesan como si no existiera. Es perfecto para zonas de puntuación, triggers, checkpoints, etc.

```tsx
function ZonaDePuntos({ onPunto }: { onPunto: () => void }) {
  return (
    <RigidBody type="fixed" position={[0, 1.5, 0]}>
      {/* Visual del objetivo (opcional) */}
      <mesh>
        <torusGeometry args={[0.8, 0.1, 8, 16]} />
        <meshStandardMaterial color="gold" transparent opacity={0.5} />
      </mesh>

      {/* Sensor invisible: detecta sin bloquear */}
      <CuboidCollider
        args={[0.9, 0.2, 0.9]}
        sensor={true}
        onIntersectionEnter={({ other }) => {
          // other.rigidBody → el RapierRigidBody que entró
          // other.rigidBodyObject → el Object3D de Three.js correspondiente
          console.log('Objeto entró:', other.rigidBodyObject?.name)
          onPunto()
        }}
        onIntersectionExit={({ other }) => {
          console.log('Objeto salió')
        }}
      />
    </RigidBody>
  )
}
```

**Resumen de eventos:**

| Evento                | Cuándo se dispara                    | Disponible en                 |
| --------------------- | ------------------------------------ | ----------------------------- |
| `onIntersectionEnter` | Algo entra en el sensor              | Colliders con `sensor={true}` |
| `onIntersectionExit`  | Algo sale del sensor                 | Colliders con `sensor={true}` |
| `onCollisionEnter`    | Colisión física real (con respuesta) | Colliders normales            |
| `onCollisionExit`     | Fin de contacto físico               | Colliders normales            |

---

## FASE 2: Water Ring Toss

### Archivo Principal

- **`src/tutorials/02-water-ring-toss.tsx`** — Implementación completa del juego

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

  // Durante desarrollo, loguea los nodos para saber qué hay en el archivo
  useEffect(() => {
    console.log('Nodos disponibles:', Object.keys(nodes))
    console.log('Materiales disponibles:', Object.keys(materials))
  }, [nodes, materials])

  return <group dispose={null}>{/* Renderiza los nodos según necesites */}</group>
}
```

**Convención de nombres desde Blender:**

Nombrar los objetos en Blender con prefijos claros facilita mucho saber qué tipo de física aplicar en código:

- `Capsule_Wall_Left`, `Capsule_Wall_Right`, `Capsule_Floor` → `fixed`
- `Block_Animated_01`, `Block_Animated_02` → `kinematicPosition`
- `Ring_01`, `Ring_02` → `dynamic` con CCD
- `Decoration_Static_XX` → sin física (solo visual)

#### Paso 2: Físicas Básicas

**Contenedor tipo cápsula (compound de cuboids):**

El contenedor es la pieza clave del juego: un recinto cerrado donde los aros rebotan. La primera pregunta es: ¿por qué no usar TrimeshCollider si ya tenemos el modelo 3D?

**¿Por qué NO TrimeshCollider para el contenedor?**

1. **No hay colisiones internas:** Rapier no detecta colisiones desde dentro de un Trimesh. Los aros que están dentro del contenedor simplemente lo atravesarían hacia afuera.
2. **Rendimiento:** Trimesh es 10x más lento que compound de primitivas.
3. **Control:** Con cuboids individuales puedes ajustar cada pared independientemente.

**Solución: 5 CuboidColliders (4 paredes + 1 suelo):**

```tsx
function ContenedorCapsula() {
  return (
    <RigidBody type="kinematicPosition" position={[0, 1.5, 0]}>
      {/* Pared izquierda */}
      <CuboidCollider args={[0.1, 1.5, 2]} position={[-2.1, 0, 0]} />
      {/* Pared derecha */}
      <CuboidCollider args={[0.1, 1.5, 2]} position={[2.1, 0, 0]} />
      {/* Pared trasera */}
      <CuboidCollider args={[2, 1.5, 0.1]} position={[0, 0, -2.1]} />
      {/* Pared delantera */}
      <CuboidCollider args={[2, 1.5, 0.1]} position={[0, 0, 2.1]} />
      {/* Suelo */}
      <CuboidCollider args={[2, 0.1, 2]} position={[0, -1.6, 0]} />
    </RigidBody>
  )
}
```

#### Paso 3: Bloques Kinematic Animados

Los bloques se mueven de forma autónoma dentro del contenedor, empujando los aros.

```tsx
function BloqueAnimado({
  position,
  amplitude = 1.5,
  speed = 2
}: {
  position: [number, number, number]
  amplitude?: number
  speed?: number
}) {
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
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
    </RigidBody>
  )
}
```

**¿Por qué `kinematicPosition` y NO `useAnimations` de drei?**

`useAnimations` reproduce animaciones de Blender en la malla Three.js, pero no comunica ese movimiento a Rapier. El collider físico se queda estático aunque la malla se mueva visualmente. Resultado: los bloques no empujan los aros, solo se los pasan "fantasma".

Con `kinematicPosition`, el movimiento **ocurre en el mundo físico de Rapier**, y Three.js solo sincroniza la posición visual como consecuencia. Los bloques sí empujan los aros.

#### Paso 4: Rotación Unificada Móvil/PC

La mecánica central del juego: inclinar el dispositivo (móvil) o arrastrar el mouse (PC) para controlar la dirección en que caen los aros.

La clave es que en lugar de rotar visualmente la escena (costoso y complejo), **rotamos el vector de gravedad**. Para Rapier, es como si el mundo entero se inclinara.

**Hook personalizado para controles:**

```tsx
function useRotationControl(enabled: boolean) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const targetRotation = useRef({ x: 0, y: 0, z: 0 })
  const lastMouse = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  // PC: mouse drag
  useEffect(() => {
    if (!enabled) return

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const handleMouseUp = () => { isDragging.current = false }
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const deltaX = e.clientX - lastMouse.current.x
      const deltaY = e.clientY - lastMouse.current.y
      targetRotation.current.y += deltaX * 0.01
      targetRotation.current.x += deltaY * 0.01
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [enabled])

  // Móvil: giroscopio
  useEffect(() => {
    if (!enabled) return

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      // gamma: inclinación izquierda/derecha (-90 a 90)
      // beta: inclinación adelante/atrás (0 a 180)
      targetRotation.current.z = (e.gamma || 0) * (Math.PI / 180)
      targetRotation.current.x = (e.beta || 0) * (Math.PI / 180)
    }
    window.addEventListener('deviceorientation', handleDeviceOrientation)
    return () => window.removeEventListener('deviceorientation', handleDeviceOrientation)
  }, [enabled])

  // Interpolación suave: el objetivo cambia bruscamente, la rotación real lo sigue suavemente
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

**Calcular gravedad basada en rotación y aplicarla:**

La rotación del dispositivo se convierte en un vector de gravedad rotado, que se pasa como prop a `<Physics>`. Rapier recalcula todas las fuerzas automáticamente en el siguiente paso.

```tsx
function calcularGravedadParaRotacion(rotation: { x: number, y: number, z: number }) {
  const gravity = new THREE.Vector3(0, -9.81, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromEuler(new THREE.Euler(-rotation.x, -rotation.y, -rotation.z))
  gravity.applyQuaternion(quaternion)
  return [gravity.x, gravity.y, gravity.z] as [number, number, number]
}

// En el componente principal:
function EscenaJuego() {
  const rotation = useRotationControl(true)
  const gravity = calcularGravedadParaRotacion(rotation)

  return (
    // gravity cambia en cada frame según la inclinación
    // Physics lo recibe como prop reactivo y actualiza la simulación
    <Physics gravity={gravity}>
      {/* ... resto de la escena */}
    </Physics>
  )
}
```

#### Paso 5: Agitación con Acelerómetro

Agitar el dispositivo lanza los aros hacia arriba con un impulso proporcional a la intensidad del shake.

**Detección de shake:**

```tsx
function useShakeDetection(onShake: (intensity: number) => void) {
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 })
  const shakeThreshold = 15 // m/s² — ajusta según sensibilidad deseada

  useEffect(() => {
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return

      // Calculamos cuánto cambió la aceleración respecto al frame anterior
      const deltaAcc = Math.sqrt(
        Math.pow((acc.x ?? 0) - lastAcceleration.current.x, 2) +
        Math.pow((acc.y ?? 0) - lastAcceleration.current.y, 2) +
        Math.pow((acc.z ?? 0) - lastAcceleration.current.z, 2)
      )

      if (deltaAcc > shakeThreshold) {
        onShake(deltaAcc) // Pasamos la intensidad para escalar el impulso
      }

      lastAcceleration.current = {
        x: acc.x ?? 0,
        y: acc.y ?? 0,
        z: acc.z ?? 0
      }
    }

    window.addEventListener('devicemotion', handleDeviceMotion)
    return () => window.removeEventListener('devicemotion', handleDeviceMotion)
  }, [onShake])
}
```

**Permisos en iOS:**

iOS 13+ requiere que el usuario conceda permiso explícito para acceder al giroscopio y acelerómetro. Debe hacerse desde un gesto de usuario (no puede ser automático al cargar la página).

```tsx
async function solicitarPermisosSensores(): Promise<boolean> {
  // DeviceOrientationEvent.requestPermission solo existe en iOS 13+
  // En Android y desktop simplemente no existe esta función
  const deviceOrientationAny = DeviceOrientationEvent as any

  if (typeof deviceOrientationAny.requestPermission === 'function') {
    try {
      const permission = await deviceOrientationAny.requestPermission()
      return permission === 'granted'
    } catch {
      return false
    }
  }

  return true // Android y desktop no requieren permiso explícito
}

function BotonJugar({ onJugar }: { onJugar: () => void }) {
  const handleClick = async () => {
    const tienePermiso = await solicitarPermisosSensores()
    if (tienePermiso) onJugar()
    else alert('Necesitamos acceso al giroscopio para jugar')
  }

  return <button onClick={handleClick}>Jugar</button>
}
```

#### Paso 6: Detección de Targets y Victoria

**Zona target con sensor:**

El sensor detecta cuándo un aro entra en la zona de puntuación. Usamos un `Set` en un ref para evitar que el mismo aro sume puntos múltiples veces.

```tsx
function ZonaTarget({
  target,
  onAtrapado
}: {
  target: { id: string; position: [number,number,number]; color: string; points: number }
  onAtrapado: (id: string, points: number) => void
}) {
  // Ref en lugar de estado para no re-renderizar y para acceso desde callbacks de física
  const alreadyScored = useRef<Set<string>>(new Set())

  return (
    <RigidBody type="fixed" position={target.position}>
      {/* Visual del objetivo */}
      <mesh>
        <torusGeometry args={[0.6, 0.05, 8, 16]} />
        <meshStandardMaterial
          color={target.color}
          emissive={target.color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Sensor de detección */}
      <CuboidCollider
        args={[0.7, 0.2, 0.7]}
        sensor={true}
        onIntersectionEnter={({ other }) => {
          const aroId = other.rigidBodyObject?.uuid
          // Evitar contar el mismo aro dos veces si rebota en el sensor
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
function useGameState(totalTargets: number) {
  const [gameState, setGameState] = useState({
    score: 0,
    startTime: Date.now(),
    completed: false,
    targetsHit: [] as string[],
  })

  const addPoints = useCallback((targetId: string, points: number) => {
    setGameState(prev => {
      // Evitar contar el mismo target dos veces (doble seguridad)
      if (prev.targetsHit.includes(targetId)) return prev

      const newTargetsHit = [...prev.targetsHit, targetId]
      return {
        ...prev,
        score: prev.score + points,
        targetsHit: newTargetsHit,
        completed: newTargetsHit.length >= totalTargets,
      }
    })
  }, [totalTargets])

  const elapsedSeconds = Math.floor((Date.now() - gameState.startTime) / 1000)

  return { gameState, addPoints, elapsedSeconds }
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
  type RapierRigidBody
} from '@react-three/rapier'
import { useGLTF, ContactShadows, Environment, Stats } from '@react-three/drei'
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'
```

### Configuración Óptima para Móviles

```tsx
<Canvas
  dpr={[1, 1.5]}  // DPI dinámico: sube calidad en pantallas de alta resolución hasta 1.5x
  gl={{
    antialias: false,       // Desactivar MSAA nativo (usamos SMAA por post-processing)
    powerPreference: 'high-performance',
    stencil: false,         // No usamos stencil buffer, ahorrar memoria
  }}
>
  <Physics
    gravity={[0, -9.81, 0]}
    timeStep={1/60}
    numSolverIterations={3}       // Reducido de 4 a 3 para móviles
    numInternalPgsIterations={1}  // Mantener en 1 (default)
  >
    {/* ... escena */}
  </Physics>

  <EffectComposer disableNormalPass>
    <Bloom luminanceThreshold={0.8} intensity={0.5} />
    <SMAA />  {/* Anti-aliasing eficiente por post-processing */}
  </EffectComposer>
</Canvas>
```

### Checklist de Rendimiento

- ✅ Cero TrimeshColliders en objetos `dynamic` o `kinematic`
- ✅ Usar compound colliders de primitivas para formas complejas
- ✅ CCD solo en objetos rápidos que puedan tener tunneling
- ✅ Sleeping automático activado (es el default en Rapier, no hace falta configurarlo)
- ✅ Máximo ~20 cuerpos físicos activos simultáneamente
- ✅ Texturas comprimidas en formato KTX2 (usar `npx @gltf-transform/cli optimize modelo.glb modelo-opt.glb`)
- ✅ DPR dinámico `[1, 1.5]` en Canvas
- ✅ `numSolverIterations={3}` en móviles (en lugar del default 4)
- ✅ `ContactShadows` de drei en lugar de sombras de luz completas
- ✅ SMAA por post-processing en lugar de MSAA nativo

---

## Preguntas Frecuentes

### ¿Por qué mi objeto kinematic no se mueve?

```tsx
// ❌ INCORRECTO — modifica Three.js pero Rapier no se entera
ref.current.translation().x = 5

// ✅ CORRECTO — actualiza el estado interno de Rapier
ref.current.setNextKinematicTranslation({ x: 5, y: 0, z: 0 })
```

### ¿Por qué los aros atraviesan las paredes?

1. Activar CCD en los aros: `<RigidBody ccd={true}>`
2. Aumentar `numSolverIterations` en `<Physics>`
3. Si caen desde muy alto, reducir `timeStep` (ej. `1/120`) para pasos más pequeños

### ¿Por qué no puedo usar un TorusCollider?

Rapier no tiene collider de toro nativo. Aproxima el anillo con N `SphereCollider` distribuidas en círculo dentro del mismo `<RigidBody>` (compound collider). 8 esferas dan buen balance entre precisión y rendimiento.

### ¿Cómo depurar colliders?

```tsx
<Physics debug={true}>
  {/* Muestra wireframes de todos los colliders en escena */}
</Physics>
```

### ¿Los sensores afectan la física?

No. Los sensores con `sensor={true}` detectan intersecciones pero no generan respuesta física. Los objetos dinámicos los atraviesan libremente; solo se disparan los eventos `onIntersectionEnter` / `onIntersectionExit`.

### ¿Cuándo usar `timeStep="vary"` vs número fijo?

Usa `"vary"` para juegos casuales donde la fluidez visual importa más que el determinismo. Usa número fijo (`1/60`) para simulaciones que deben ser reproducibles o para evitar inestabilidad cuando el framerate cae mucho.

---

## Recursos Adicionales

- [Documentación oficial de Rapier](https://rapier.rs/docs/)
- [@react-three/rapier GitHub](https://github.com/pmndrs/react-three-rapier)
- [API Docs PhysicsProps](https://pmndrs.github.io/react-three-rapier/interfaces/PhysicsProps.html)
- [Ejemplos de Drei](https://github.com/pmndrs/drei)
