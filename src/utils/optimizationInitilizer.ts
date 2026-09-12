export type Tier = 'low' | 'mid' | 'high' | 'ultra'
export const TIER_ORDER: Tier[] = ['low', 'mid', 'high', 'ultra']
const TIER_RESOLUTION_FACTOR: Record<Tier, number> = {
  low: 0.35,
  mid: 0.6,
  high: 0.85,
  ultra: 1.0,
}
//depends on gpu capabilities
export const TIER_SETTINGS = {
  low: { samples: 1, useTransmission: false },
  mid: { samples: 4, useTransmission: true },
  high: { samples: 4, useTransmission: true },
  ultra: { samples: 4, useTransmission: true },
}
const MAX_RESOLUTION_CAP = 2048
const MIN_RESOLUTION_FLOOR = 630
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getNativePixelSize(dpr: number) {
  return {
    width: Math.round(window.innerWidth * dpr),
    height: Math.round(window.innerHeight * dpr),
  }
}

export function getTierSettings(
  dpr: number
): Record<Tier, { resolution: number; samples: number; useTransmission: boolean }> {
  const { width: native } = getNativePixelSize(dpr)
  const settings = {} as Record<
    Tier,
    { resolution: number; samples: number; useTransmission: boolean }
  >

  for (const tier of TIER_ORDER) {
    const target = Math.round(native * TIER_RESOLUTION_FACTOR[tier])
    const ceiling = Math.max(Math.min(native, MAX_RESOLUTION_CAP), MIN_RESOLUTION_FLOOR)

    const resolution = clamp(target, MIN_RESOLUTION_FLOOR, ceiling)
    settings[tier] = { resolution, ...TIER_SETTINGS[tier] }
  }

  return settings
}
export function getInitialTier(): Tier {
  const ua = navigator.userAgent
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Mobi/i.test(ua))
  const cores = navigator.hardwareConcurrency || 4
  const rawDpr = window.devicePixelRatio || 1
  const { width, height } = getNativePixelSize(rawDpr)
  const visiblePixels = width * height

  if (isMobile && cores <= 4) return 'low'
  if (isMobile || rawDpr > 2) return 'mid'
  // ~1440p (4k) en 2x
  if (visiblePixels > 3_600_000) return 'ultra'
  return 'high'
}
