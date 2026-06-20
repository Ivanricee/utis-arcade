import { create } from 'zustand'

interface RingState {
  ringIndex: number
  postIndex: number | null
}

interface GameStore {
  rings: RingState[]
  score: number
  waterActive: boolean
  setRingInPost: (ringIndex: number, postIndex: number | null) => void
  resetRings: (totalRings: number) => void
  setWaterActive: (active: boolean) => void
}

export const useGameStore = create<GameStore>((set) => ({
  rings: [],
  score: 0,
  waterActive: false,
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
}))
