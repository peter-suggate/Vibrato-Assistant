import { expect } from 'chai';
import VariablePeriodNoteRecorder from 'helpers/Audio/VariablePeriodNoteRecorder';

describe('VariablePeriodNoteRecorder', () => {
  describe('addCurrentPitch', () => {
    const noteRecorder = new VariablePeriodNoteRecorder(true);
    noteRecorder.start();
    it('returns false when called in presence of only a single pitch', () => {
      expect(noteRecorder.addCurrentPitch(440)).to.equal(false);
    });

    it('returns false when called on two duplicate pitches added', () => {
      expect(noteRecorder.addCurrentPitch(440)).to.equal(false);
    });

    it('returns true when called after a distinct pitch is added', () => {
      expect(noteRecorder.addCurrentPitch(660)).to.equal(true);
    });
  });

  describe('getLatestNote (offline)', () => {
    const noteRecorder = new VariablePeriodNoteRecorder();
    noteRecorder.start();

    const noteDuration = 1;
    const longNoteDuration = 5;
    it('returns the first note when a new pitch is added', () => {
      expect(noteRecorder.addCurrentPitch(440, noteDuration)).to.equal(false);
      expect(noteRecorder.addCurrentPitch(660, longNoteDuration)).to.equal(true);
      const note = noteRecorder.getLatestNote();
      expect(note.notePitch).to.equal(440);
    });

    let note = null;
    it('returns the second note when a new pitch is added', () => {
      expect(noteRecorder.addCurrentPitch(220, noteDuration)).to.equal(true);
      note = noteRecorder.getLatestNote();
      expect(note.notePitch).to.equal(660);
    });

    it('returns correct note time and duration information', () => {
      expect(note.durationMsec).to.equal(longNoteDuration);
      expect(note.startTimeMsec).to.equal(1);

      expect(noteRecorder.addCurrentPitch(440, noteDuration)).to.equal(true);
      note = noteRecorder.getLatestNote();
      expect(note.durationMsec).to.equal(noteDuration);
      expect(note.startTimeMsec).to.equal(6);
    });
  });

  describe('getLatestNote (online)', () => {
    const noteRecorder = new VariablePeriodNoteRecorder(true);
    noteRecorder.start();

    it('returns the first note when a new pitch is added of sensible duration and start time', () => {
      expect(noteRecorder.addCurrentPitch(440)).to.equal(false);
      expect(noteRecorder.addCurrentPitch(660)).to.equal(true);
      const note = noteRecorder.getLatestNote();
      expect(note.notePitch).to.equal(440);
      expect(note.durationMsec).to.be.at.least(0);
      expect(note.startTimeMsec).to.be.at.least(0);
    });
  });

  describe('timeAfterStartMsec (offline)', () => {
    const noteRecorder = new VariablePeriodNoteRecorder();
    noteRecorder.start();

    const noteDuration = 7;
    it('returns correct time after a pitch has been added', () => {
      noteRecorder.addCurrentPitch(440, noteDuration);
      expect(noteRecorder.timeAfterStartMsec()).to.equal(noteDuration);
    });

    it('returns correct time after two pitches have been added', () => {
      noteRecorder.addCurrentPitch(660, 2 * noteDuration);
      expect(noteRecorder.timeAfterStartMsec()).to.equal(noteDuration + 2 * noteDuration);
    });
  });

  describe('timeAfterStartMsec (online)', () => {
    const noteRecorder = new VariablePeriodNoteRecorder(true);
    noteRecorder.start();

    it('returns correct time after a pitch has been added', () => {
      noteRecorder.addCurrentPitch(440);
      expect(noteRecorder.timeAfterStartMsec()).to.be.at.least(0);
    });
  });
});
