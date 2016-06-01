class TimeTracker
{
  constructor(online) {
    this.online = online;
    this.firstIntervalStartTime = null;
    this.curIntervalStartTime = 0;
    this.curIntervalDuration = 0;
  }

  start() {
    this.firstIntervalStartTime = Date.now();

    this.beginNewInterval();
  }

  quantaAdded(msec) {
    if (!this.online) {
      this.curIntervalDuration += msec;
    }
  }

  beginNewInterval() {
    if (this.online) {
      this.curIntervalStartTime = Date.now();
    } else {
      this.curIntervalDuration = 0;
    }
  }

  finishCurrentInterval() {
    if (!this.online) {
      this.curIntervalStartTime += this.curIntervalDuration;
    }
  }

  currentIntervalStartTime() {
    if (this.online) {
      return this.curIntervalStartTime - this.firstIntervalStartTime;
    }

    return this.curIntervalStartTime;
  }

  currentIntervalDuration() {
    if (this.online) {
      return Date.now() - this.curIntervalStartTime;
    }

    return this.curIntervalDuration;
  }
}

// Receives a steady stream of pitches from the client (at a highish sampling
// rate) and spits out notes of variable length.
export default class VariablePeriodNoteRecorder {
  constructor() {
    this.currentNotePitches = [];
    this.latestNote = null;
  }

  start() {
    this.timeTracker = new TimeTracker();
    this.timeTracker.start();
  }

  addCurrentPitch(pitch, quantaDurationMsec) {
    this._ensureValid();

    const logPitch = this._toInternalPitchRep(pitch);
    const noteAdded = this._detectedEndOfCurrentNote(logPitch);
    if (noteAdded) {
      this._finishCurrentNote();
      this._beginNewNote();
    }
    this._addCurrentPitch(logPitch, quantaDurationMsec);
    return noteAdded;
  }

  stop() {
    this.currentNotePitches = [];
    this.timeTracker = null;
  }

  getLatestNote() {
    return this.latestNote;
  }

  // Private methods

  _ensureValid() {
    if (!this.timeTracker) {
      throw new Error('start() must be called first');
    }
  }

  _addCurrentPitch(logPitch, quantaDurationMsec) {
    this.currentNotePitches.push(logPitch);

    if (typeof(quantaDurationMsec) !== 'undefined') {
      // Pass a valid quantaDurationMsec when driving the note recording process offline.
      this.timeTracker.quantaAdded(quantaDurationMsec);
    }
  }

  _beginNewNote() {
    this.timeTracker.beginNewInterval();
  }

  _finishCurrentNote() {
    const {timeTracker} = this;

    this.latestNote = {
      notePitch: this._toPitchInHz(this._calculateRepresentativeNotePitch()),
      startTimeMsec: timeTracker.currentIntervalStartTime(),
      durationMsec: timeTracker.currentIntervalDuration()
    };

    timeTracker.finishCurrentInterval();
    this.currentNotePitches = [];
  }

  _detectedEndOfCurrentNote(logPitch) {
    const {currentNotePitches} = this;
    const numPitches = currentNotePitches.length;

    if (numPitches === 0) {
      return false; // Not enough pitches yet.
    }

    // For now, rudimentary scheme that checks the most recent pitch against
    // its previous.
    const mostRecentPitch = logPitch;
    const previousPitch = currentNotePitches[numPitches - 1];
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
    this.currentNotePitches.forEach((pitch) => {
      total += pitch;
    });
    total /= this.currentNotePitches.length;
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
