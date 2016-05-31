// Receives a steady stream of pitches from the client (at a highish sampling
// rate) and spits out notes of variable length.
export default class VariablePeriodNoteRecorder {
  constructor() {
    this.pitchBuffer = [];
    this.latestNote = null;
    this.currentNoteStartTime = null;
  }

  start() {
    this.firstNoteStartTime = Date.now();
    this.currentNoteStartTime = this.firstNoteStartTime;
    this.noteDurationMsec = 0;
  }

  timeAfterStartMsec() {
    return Date.now() - this.firstNoteStartTime;
  }

  addCurrentPitch(pitch, quantaDurationMsec) {
    const ret = this._addCurrentPitch(pitch);

    if (typeof(quantaDurationMsec) !== 'undefined') {
      // Pass a valid quantaDurationMsec when driving the note recording process offline.
      this.noteDurationMsec += quantaDurationMsec;
    } else {
      // Pass in no quantaDurationMsec when driving the note recording process online (in "real time").
      this.noteDurationMsec = Date.now() - this.currentNoteStartTime;
    }

    return ret;
  }

  stop() {
    this.pitchBuffer = [];
  }

  getLatestNote() {
    return this.latestNote;
  }

  // Private methods

  _addCurrentPitch(pitch) {
    const logPitch = this._toInternalPitchRep(pitch);
    if (this._detectedEndOfNote(logPitch)) {
      // const noteDurationMsec = Date.now() - this.currentNoteStartTime;
      this.latestNote = {
        notePitch: this._toPitchInHz(this._calculateRepresentativeNotePitch()),
        startTimeMsec: this.currentNoteStartTime - this.firstNoteStartTime,
        durationMsec: this.noteDurationMsec
      };

      this.pitchBuffer = [logPitch];
      this.currentNoteStartTime += this.noteDurationMsec;
      this.noteDurationMsec = 0;
      return true;
    }

    this.pitchBuffer.push(logPitch);
    return false;
  }

  _detectedEndOfNote(logPitch) {
    const {pitchBuffer} = this;
    const numPitches = pitchBuffer.length;

    if (numPitches === 0) {
      return false; // Not enough pitches yet.
    }

    // For now, rudimentary scheme that checks the most recent pitch against
    // its previous.
    const mostRecentPitch = logPitch;
    const previousPitch = pitchBuffer[numPitches - 1];
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

  _round2dp(number) {
    return Math.round(number * 100) / 100;
  }

  _toInternalPitchRep(pitchInHz) {
    return Math.log2(pitchInHz);
  }

  _toPitchInHz(pitchInternalRep) {
    return this._round2dp(Math.pow(2, pitchInternalRep));
  }
}
