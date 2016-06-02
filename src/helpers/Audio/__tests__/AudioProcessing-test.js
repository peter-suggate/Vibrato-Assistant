import { expect } from 'chai';
import {
  noteToPitch,
  pitchToNote,
  noteIndexConcertA,
  logOfDifferenceBetweenAdjacentSemitones,
  round2dp
} from 'helpers/Audio/AudioProcessing';

describe('noteToPitch', () => {
  const aPitch = noteToPitch(noteIndexConcertA);
  it('should return correct frequency for notes of known pitch', () => {
    expect(aPitch).to.equal(440);
  });

  it('should return correct note index for known pitch', () => {
    expect(pitchToNote(aPitch)).to.equal(noteIndexConcertA);
  });
});

describe('logOfDifferenceBetweenAdjacentSemitones', () => {
  const concertAPitch = noteToPitch(noteIndexConcertA);
  const octaveAboveConcertAPitch = 2 * concertAPitch;

  it('should allow us to reconstruct a new pitch', () => {
    expect(octaveAboveConcertAPitch).to.equal(
      round2dp(Math.pow(2, Math.log2(concertAPitch) + (12 * logOfDifferenceBetweenAdjacentSemitones())))
      );
  });
});
