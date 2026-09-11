export type Tier = 'low' | 'mid' | 'high' | 'ultra'

function getScreenPixelBudget() {
  const dpr = window.devicePixelRatio || 1
  // screen.width/height ya vienen en px lógicos (CSS), multiplicar por dpr da los px físicos reales
  return window.screen.width * dpr * window.screen.height * dpr
}

export function getInitialTier(): Tier {
  const ua = navigator.userAgent
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Mobi/i.test(ua))
  const cores = navigator.hardwareConcurrency || 4
  const rawDpr = window.devicePixelRatio || 1
  const screenPixels = getScreenPixelBudget()

  if (isMobile && cores <= 4) return 'low'
  if (isMobile || rawDpr > 2) return 'mid'
  // ~1440p (4k) en 2x
  if (screenPixels > 3_600_000) return 'ultra'
  return 'high'
}

export const TIER_SETTINGS = {
  low: { resolution: 256, samples: 1, useTransmission: false },
  mid: { resolution: 1024, samples: 7, useTransmission: true },
  high: { resolution: 1500, samples: 14, useTransmission: true },
  ultra: { resolution: 2048, samples: 10, useTransmission: true },
}

export const TIER_ORDER: Tier[] = ['low', 'mid', 'high', 'ultra']
