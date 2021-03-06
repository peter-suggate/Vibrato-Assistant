import * as Audio from './audio-processing'

const fakePitches = []
let fakePitchIndex = 0
const pitches = 24
const pitchDuration = 40
const startNote = 60
const numIndices = pitches * pitchDuration

export function nextFakePitch () {
  if (fakePitches.length === 0) {
    for (let idx = 0; idx < pitches; ++idx) {
      const pitch = Audio.noteToPitch(startNote + idx)
      for (let jdx = 0; jdx < pitchDuration; ++jdx) {
        fakePitches.push(pitch)
      }
    }
  }

  const wrappedIndex = fakePitchIndex++ % numIndices
  return fakePitches[wrappedIndex]
}

let time = 0
export function nextFakeVolume () {
  return 0.5 + (0.5 * Math.sin(time++ * 0.1))
}
