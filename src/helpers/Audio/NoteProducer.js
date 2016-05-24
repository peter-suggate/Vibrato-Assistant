// Receives a steady stream of pitches from the client (at a highish sampling
// rate) and spit out the best guess of a note at the specified frequency.
export class NoteProducer {
  constructor(noteFrequency) {
    this.noteFrequency = noteFrequency;
    this.pitchBuffer = [];
    this.latestNotePitch = 0;
  }

  start() {
    this.firstNoteStartTime = Date.now();
  }

  addCurrentPitch(pitch) {
    this.pitchBuffer.push(pitch);

    if (this._canOutputNewNote()) {
      this.latestNotePitch = this._calculateRepresentativeNotePitch();
      this.pitchBuffer = [];
      return true;
    }

    return false;
  }

  stop() {
    this.pitchBuffer = [];
  }

  getClosestNotePitch() {
    return this.latestNotePitch;
  }

  // Private methods

  _canOutputNewNote() {
    const time = Date.now();

    return this._numberOfNotesInInterval(this.currentNoteStartTime, time) > 0;
  }

  _numberOfNotesInInterval(timeStart, timeEnd) {
    const timeDifference = timeEnd - timeStart;
    const periodMsec = 1000.0 / this.noteFrequency;
    return Math.floor(timeDifference / periodMsec);
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
