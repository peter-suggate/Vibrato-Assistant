// Receives a steady stream of pitches from the client (at a highish sampling
// rate) and spit out the best guess of a note at the specified frequency.
export default class NoteRecorder {
  constructor(noteBpm) {
    this.noteBpm = noteBpm;
    this.pitchBuffer = [];
    this.latestNotePitch = 0;
    this.currentNoteStartTime = null;
  }

  start() {
    this.firstNoteStartTime = Date.now();
    this.currentNoteStartTime = this.firstNoteStartTime;
  }

  addCurrentPitch(pitch) {
    this.pitchBuffer.push(pitch);

    if (this._canOutputNewNote()) {
      this.latestNotePitch = this._calculateRepresentativeNotePitch();
      this.pitchBuffer = [];
      this.currentNoteStartTime = this.firstNoteStartTime + this._periodMsec();
      return true;
    }

    return false;
  }

  stop() {
    this.pitchBuffer = [];
  }

  getLatestNotePitch() {
    return this.latestNotePitch;
  }

  // Private methods

  _canOutputNewNote() {
    const time = Date.now();

    return this._numberOfNotesInInterval(this.currentNoteStartTime, time) > 0;
  }

  _periodMsec() {
    const periodMsec = 1000.0 * (60 / this.noteBpm);
    return periodMsec;
  }

  _numberOfNotesInInterval(timeStart, timeEnd) {
    const timeDifference = timeEnd - timeStart;
    return Math.floor(timeDifference / this._periodMsec());
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
