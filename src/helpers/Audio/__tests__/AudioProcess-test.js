import { expect } from 'chai';
import { noteToPitch, pitchToNote, noteIndexConcertA } from 'helpers/Audio/AudioProcessing';

describe('noteToPitch', () => {
  const aPitch = noteToPitch(noteIndexConcertA);
  it('should return correct frequency for notes of known pitch', () => {
    expect(aPitch).to.equal(440);
  });

  it('should return correct note index for known pitch', () => {
    expect(pitchToNote(aPitch)).to.equal(noteIndexConcertA);
  });
});
