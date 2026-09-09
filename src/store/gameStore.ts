import type { RapierRigidBody } from '@react-three/rapier'
import { create } from 'zustand'
import { getInitialTier, TIER_ORDER, type Tier } from '../utils/optimizationInitilizer'

interface RingState {
  ringIndex: number
  postIndex: number | null
}

interface GameStore {
  rings: RingState[]
  score: number
  waterActive: boolean
  floatingBodies: RapierRigidBody[]
  tier: Tier
  dpr: number
  registerFloatingBody: (body: RapierRigidBody) => void
  unregisterFloatingBody: (body: RapierRigidBody) => void
  setRingInPost: (ringIndex: number, postIndex: number | null) => void
  resetRings: (totalRings: number) => void
  setWaterActive: (active: boolean) => void
  downgrade: () => void
  upgrade: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  // state
  rings: [],
  score: 0,
  waterActive: false,
  floatingBodies: [],
  //optimizations state
  tier: getInitialTier(),
  dpr: 1.5,

  // actions
  registerFloatingBody: (body) =>
    set((state) => ({ floatingBodies: [...state.floatingBodies, body] })),
  unregisterFloatingBody: (body) =>
    set((state) => ({ floatingBodies: state.floatingBodies.filter((b) => b !== body) })),
  setRingInPost: (ringIndex, postIndex) => {
    set((state) => {
      const rings = state.rings.map((r) => (r.ringIndex === ringIndex ? { ...r, postIndex } : r))
      const score = rings.filter((r) => r.postIndex !== null).length
      return { rings, score }
    })
  },
  resetRings: (totalRings) => {
    const rings: RingState[] = Array.from({ length: totalRings }, (_, i) => ({
      ringIndex: i,
      postIndex: null,
    }))
    set({ rings, score: 0 })
  },
  setWaterActive: (active) => set({ waterActive: active }),
  //  optimizations actions
  downgrade: () =>
    set((state) => {
      const i = TIER_ORDER.indexOf(state.tier)
      return { tier: TIER_ORDER[Math.max(0, i - 1)], dpr: 1 }
    }),
  upgrade: () =>
    set((state) => {
      const i = TIER_ORDER.indexOf(state.tier)
      return {
        tier: TIER_ORDER[Math.min(TIER_ORDER.length - 1, i + 1)],
        dpr: window.devicePixelRatio > 1 ? 2 : 1,
      }
    }),
}))
