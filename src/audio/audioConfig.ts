export type SpriteMap = Record<string, [number, number] | [number, number, boolean]>

export interface AudioFile {
  src: string[]
  sprite: SpriteMap
}

export const AUDIO_FILES: Record<'clacks' | 'jets' | 'win', AudioFile> = {
  clacks: {
    src: ['/audio/clack.ogg', '/audio/clack.mp3'],
    sprite: {
      clack1: [230, 350],
      clack2: [1362, 1462],
      clack3: [1704, 1851],
      clack4: [2067, 2200],
      clack5: [2724, 2857],
    },
  },
  jets: {
    src: ['/audio/jet.ogg', '/audio/jet.mp3'],
    sprite: {
      jet1: [1054, 1989, true],
      jet2: [2170, 2818, true],
      jet3: [3542, 4114, true],
      jet4: [4431, 4974, true],
    },
  },
  win: {
    src: ['/audio/win.ogg', '/audio/win.mp3'],
    sprite: { win1: [0, 3474] },
  },
}

export const COLLISION_AUDIO = {
  minSpeed: 0.28,
  maxSpeed: 4,
  minVolume: 0.15,
  ringCooldownMs: 100,
  globalCooldownMs: 70,
  maxVoices: 6,
  pitchJitter: 0.08,
  postPitch: 0.8,
  debug: false,
}

export const JET_AUDIO = { volume: 1, fadeInMs: 80, fadeOutMs: 120 }
export const WIN_AUDIO = { volume: 1 }
