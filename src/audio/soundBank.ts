import { Howl } from 'howler'
import { AUDIO_FILES } from './audioConfig'

const create = (key: keyof typeof AUDIO_FILES) =>
  new Howl({ src: AUDIO_FILES[key].src, sprite: AUDIO_FILES[key].sprite, preload: true })

export const sounds = {
  clacks: create('clacks'),
  jets: create('jets'),
  win: create('win'),
}
