import * as THREE from 'three'
type returnType = Array<{
  args: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
}>
export function generateWallData(wallsGeometry: THREE.BufferGeometry): returnType {
  const data: returnType = []

  const nonIndexed = wallsGeometry.index ? wallsGeometry.toNonIndexed() : wallsGeometry.clone()
  const positions = nonIndexed.attributes.position
  const vertexCount = positions.count

  const _vA = new THREE.Vector3()
  const _vB = new THREE.Vector3()
  const _vC = new THREE.Vector3()
  const _edge1 = new THREE.Vector3()
  const _edge2 = new THREE.Vector3()
  const _normal = new THREE.Vector3()
  const _center = new THREE.Vector3()

  // Cada cara son 3 vértices (triángulo)
  // Agrupamos pares de triángulos que compartan la misma normal
  // para generar 1 cuboid por cara del polígono original (no por triángulo)

  const faceGroups = new Map()
  for (let i = 0; i < vertexCount; i += 3) {
    _vA.fromBufferAttribute(positions, i)
    _vB.fromBufferAttribute(positions, i + 1)
    _vC.fromBufferAttribute(positions, i + 2)

    // Normal de la cara
    _edge1.subVectors(_vB, _vA)
    _edge2.subVectors(_vC, _vA)
    _normal.crossVectors(_edge1, _edge2).normalize()

    // Ignorar caras horizontales (techo y piso del mesh de referencia)
    // Solo nos interesan las caras laterales (normal mayormente horizontal)
    //if (Math.abs(_normal.y) > 0.5) continue

    // Clave para agrupar triángulos de la misma cara del polígono
    // Redondeamos la normal para agrupar los 2 triángulos del mismo quad
    const key = `${_normal.x.toFixed(1)},${_normal.z.toFixed(1)}`

    if (!faceGroups.has(key)) {
      faceGroups.set(key, {
        normal: _normal.clone(),
        vertices: [],
      })
    }

    faceGroups.get(key).vertices.push(_vA.clone(), _vB.clone(), _vC.clone())
  }
  // Por cada grupo (= cara lateral del polígono) generamos 1 CuboidCollider
  for (const [, group] of faceGroups) {
    const { normal, vertices } = group

    // Centro: promedio de todos los vértices del grupo
    _center.set(0, 0, 0)
    for (const v of vertices) _center.add(v)
    _center.divideScalar(vertices.length)

    // Calcular dimensiones del cuboid
    // Ancho: máxima distancia entre vértices en el eje tangente a la normal
    // Alto: máxima distancia entre vértices en Y
    const tangent = new THREE.Vector3(-normal.z, 0, normal.x)

    let minT = Infinity,
      maxT = -Infinity
    let minY = Infinity,
      maxY = -Infinity

    for (const v of vertices) {
      const t = v.dot(tangent)
      const y = v.y
      if (t < minT) minT = t
      if (t > maxT) maxT = t
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }

    const width = maxT - minT // ancho de la cara
    const height = maxY - minY // alto de la cara
    const depth = 0.15 // grosor del cuboid (ajusta según tu escala)

    // Rotación: alinear el cuboid a la normal de la cara
    // La normal por defecto de un CuboidCollider apunta en Z
    const dummy = new THREE.Object3D()
    dummy.position.copy(_center)
    dummy.lookAt(_center.clone().add(normal))
    const euler = dummy.rotation

    const offsetPosition = _center.clone().addScaledVector(normal, depth / 2.1)
    /*offsetPosition.y += 0.015
    offsetPosition.z += 0.008
    offsetPosition.x -= 0.005*/

    data.push({
      position: [
        parseFloat(offsetPosition.x.toFixed(4)),
        parseFloat(offsetPosition.y.toFixed(4)),
        parseFloat(offsetPosition.z.toFixed(4)),
      ] as [number, number, number],
      rotation: [
        parseFloat(euler.x.toFixed(4)),
        parseFloat(euler.y.toFixed(4)),
        parseFloat(euler.z.toFixed(4)),
      ] as [number, number, number],
      args: [
        parseFloat((width / 2).toFixed(4)),
        parseFloat((height / 2).toFixed(4)),
        parseFloat((depth / 2).toFixed(4)),
      ] as [number, number, number],
    })
  }

  /*console.log('=== DOME WALL DATA - copia y pega en domeWallData.js ===')
  console.log(JSON.stringify(data, null, 2))
  console.log('=== FIN DATA ===')*/

  return data
}
