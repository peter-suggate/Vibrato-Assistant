// Receives a steady stream of pitches from the client (at a highish sampling
// rate) and spits out notes of variable length.
export default class VariablePeriodNoteRecorder {
  constructor(noteBpm) {
    this.noteBpm = noteBpm;
    this.pitchBuffer = [];
    this.latestNote = null;
    this.currentNoteStartTime = null;
  }

  start() {
    this.firstNoteStartTime = Date.now();
    this.currentNoteStartTime = this.firstNoteStartTime;
  }

  timeAfterStartMsec() {
    return Date.now() - this.firstNoteStartTime;
  }

  addCurrentPitch(pitch) {
    this.pitchBuffer.push(pitch);

    if (this._detectedEndOfNote()) {
      const noteDurationMsec = Date.now() - this.currentNoteStartTime;
      this.latestNote = {
        notePitch: this._calculateRepresentativeNotePitch(),
        startTimeMsec: this.currentNoteStartTime - this.firstNoteStartTime,
        durationMsec: noteDurationMsec
      };

      this.pitchBuffer = [];
      this.currentNoteStartTime += noteDurationMsec;
      return true;
    }

    return false;
  }

  stop() {
    this.pitchBuffer = [];
  }

  getLatestNote() {
    return this.latestNote;
  }

  // Private methods

  _detectedEndOfNote() {
    const {pitchBuffer} = this;
    const numPitches = pitchBuffer.length;

    if (numPitches <= 1) {
      return false; // Not enough pitches yet.
    }

    // For now, rudimentary scheme that checks the most recent pitch against
    // its previous.
    const mostRecentPitch = Math.log2(pitchBuffer[numPitches - 1]);
    const previousPitch = Math.log2(pitchBuffer[numPitches - 2]);
    const ratio = mostRecentPitch / previousPitch;
    let delta = 0;
    if (ratio >= 1) {
      delta = ratio - 1;
    } else {
      delta = 1 - ratio;
    }
    if (delta > 0.0005) {
      return true;
    }

    return false;
  }

  _calculateRepresentativeNotePitch() {
    let total = 0;
    this.pitchBuffer.forEach((pitch) => {
      total += pitch;
    });
    total /= this.pitchBuffer.length;
    return total;
  }
}
