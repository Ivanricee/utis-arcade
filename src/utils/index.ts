import * as THREE from 'three'
const FONT_NAME = 'Caveat-Bold'
let fontPromise: Promise<string> | null = null

export async function loadNameFont(): Promise<string> {
  if (!fontPromise) {
    const font = new FontFace(FONT_NAME, `url(/fonts/${FONT_NAME}.woff2)`)
    fontPromise = font.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
      return FONT_NAME
    })
  }
  return fontPromise
}
interface BaseCanvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}
function hasNaturalDimensions(
  image: TexImageSource
): image is TexImageSource & { naturalWidth: number; naturalHeight: number } {
  return 'naturalWidth' in image && 'naturalHeight' in image
}
export function createDrawCanvas(image: TexImageSource): BaseCanvas {
  const width =
    'width' in image ? image.width : hasNaturalDimensions(image) ? image.naturalWidth : 0
  const height =
    'height' in image ? image.height : hasNaturalDimensions(image) ? image.naturalHeight : 0
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2d context')
  ctx.drawImage(image as CanvasImageSource, 0, 0, width, height)
  return { canvas, ctx, width, height }
}
export function createTextureFromCanvas(
  canvas: HTMLCanvasElement,
  ogTexture: THREE.Texture
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = ogTexture.colorSpace
  texture.flipY = ogTexture.flipY
  texture.wrapS = ogTexture.wrapS
  texture.wrapT = ogTexture.wrapT
  texture.repeat.copy(ogTexture.repeat)
  texture.offset.copy(ogTexture.offset)
  texture.center.copy(ogTexture.center)
  texture.rotation = ogTexture.rotation
  texture.anisotropy = ogTexture.anisotropy
  texture.minFilter = ogTexture.minFilter
  texture.magFilter = ogTexture.magFilter

  texture.needsUpdate = true
  return texture
}

export function drawText(
  name: string,
  image: TexImageSource,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  texture: THREE.CanvasTexture
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image as CanvasImageSource, 0, 0, canvas.width, canvas.height)

  if (name) {
    const x = 0.26 * canvas.width
    const y = 0.535 * canvas.height

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((-8 * Math.PI) / 180)
    ctx.globalCompositeOperation = 'multiply'
    ctx.globalAlpha = 0.8
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `24px ${FONT_NAME}`
    ctx.fillStyle = '#00205a'
    ctx.fillText(name, 0, 0)
    ctx.restore()
  }

  texture.needsUpdate = true
}

export function getBaseMaterial(scene: THREE.Object3D): THREE.MeshStandardMaterial | null {
  const mesh = scene.getObjectByName('base') as THREE.Mesh | undefined
  if (!mesh) return null
  const material = mesh.material as THREE.MeshStandardMaterial
  return material
}
export function applyNameTexture(
  material: THREE.MeshStandardMaterial,
  canvasTexture: THREE.CanvasTexture
) {
  material.map = canvasTexture
  material.needsUpdate = true
}
