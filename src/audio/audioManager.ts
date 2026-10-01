import { AUDIO_FILES, COLLISION_AUDIO as C, JET_AUDIO as J, WIN_AUDIO as W } from './audioConfig'
import { sounds } from './soundBank'

const names = {
  clacks: Object.keys(AUDIO_FILES.clacks.sprite),
  jets: Object.keys(AUDIO_FILES.jets.sprite),
  win: Object.keys(AUDIO_FILES.win.sprite),
}

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)]

let voiceEndTimes: number[] = []
let lastClackAt = 0
let jetId: number | null = null

export function playClack({ intensity, pitch = 1 }: { intensity: number; pitch?: number }) {
  const now = performance.now()
  if (now - lastClackAt < C.globalCooldownMs) return
  voiceEndTimes = voiceEndTimes.filter((time) => time > now)
  if (voiceEndTimes.length >= C.maxVoices) return
  lastClackAt = now

  const name = pick(names.clacks)
  const rate = pitch * (1 + (Math.random() * 2 - 1) * C.pitchJitter)
  const id = sounds.clacks.play(name)
  sounds.clacks.volume(C.minVolume + intensity * (1 - C.minVolume), id)
  sounds.clacks.rate(rate, id)
  voiceEndTimes.push(now + AUDIO_FILES.clacks.sprite[name][1] / rate)
}

export function startJet() {
  if (jetId !== null) return
  const id = sounds.jets.play(pick(names.jets))
  sounds.jets.volume(0, id)
  sounds.jets.fade(0, J.volume, J.fadeInMs, id)
  jetId = id
}

export function stopJet() {
  if (jetId === null) return
  const id = jetId
  jetId = null
  const currentVolume = sounds.jets.volume(id)
  sounds.jets.fade(typeof currentVolume === 'number' ? currentVolume : J.volume, 0, J.fadeOutMs, id)
  setTimeout(() => sounds.jets.stop(id), J.fadeOutMs + 20)
}

export function playWin() {
  const id = sounds.win.play(pick(names.win))
  sounds.win.volume(W.volume, id)
}
