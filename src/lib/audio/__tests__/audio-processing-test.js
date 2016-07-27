import { expect } from 'chai'
import {
  noteToPitch,
  pitchToNote,
  noteIndexConcertA,
  logOfDifferenceBetweenAdjacentSemitones,
  round2dp,
  frequncyAmplitudesToVolume
} from 'helpers/Audio/AudioProcessing'

describe('noteToPitch', () => {
  const aPitch = noteToPitch(noteIndexConcertA)
  it('should return correct frequency for notes of known pitch', () => {
    expect(aPitch).to.equal(440)
  })

  it('should return correct note index for known pitch', () => {
    expect(pitchToNote(aPitch)).to.equal(noteIndexConcertA)
  })
})

describe('logOfDifferenceBetweenAdjacentSemitones', () => {
  const concertAPitch = noteToPitch(noteIndexConcertA)
  const octaveAboveConcertAPitch = 2 * concertAPitch

  it('should allow us to reconstruct a new pitch', () => {
    expect(octaveAboveConcertAPitch).to.equal(
      round2dp(Math.pow(2, Math.log2(concertAPitch) + (12 * logOfDifferenceBetweenAdjacentSemitones())))
      )
  })
})

describe('frequncyAmplitudesToVolume', () => {
  const numFrequencies = 128
  const frequencies = []
  for (let idx = 0; idx < numFrequencies; idx++) {
    frequencies.push(idx + 0.5)
  }

  it('returns total volume from a range of frequncy amplitudes', () => {
    const totalVolume = frequncyAmplitudesToVolume(frequencies)
    expect(totalVolume).to.equal(numFrequencies / 2)
  })
})
