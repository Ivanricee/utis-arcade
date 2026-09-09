export type Tier = 'low' | 'mid' | 'high'

export function getInitialTier(): Tier {
  const ua = navigator.userAgent
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Mobi/i.test(ua))
  const cores = navigator.hardwareConcurrency || 4
  const rawDpr = window.devicePixelRatio || 1

  if (isMobile && cores <= 4) return 'low'
  if (isMobile || rawDpr > 2) return 'mid'
  return 'high'
}
export const TIER_SETTINGS = {
  low: { resolution: 256, samples: 1, useTransmission: false },
  mid: { resolution: 1024, samples: 4, useTransmission: true },
  high: { resolution: 2048, samples: 8, useTransmission: true },
}
export const TIER_ORDER: Tier[] = ['low', 'mid', 'high']
