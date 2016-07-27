// Receives a steady stream of pitches from the client (at a highish sampling
// rate) and spit out the best guess of a note at the specified frequency.
export default class FixedPeriodNoteRecorder {
  constructor (noteBpm) {
    this.noteBpm = noteBpm
    this.pitchBuffer = []
    this.latestNote = null
    this.currentNoteStartTime = null
  }

  start () {
    this.firstNoteStartTime = Date.now()
    this.currentNoteStartTime = this.firstNoteStartTime
  }

  addCurrentPitch (pitch) {
    this.pitchBuffer.push(pitch)

    if (this._canOutputNewNote()) {
      this.latestNote = {
        notePitch: this._calculateRepresentativeNotePitch(),
        startTimeMsec: this.currentNoteStartTime - this.firstNoteStartTime,
        durationMsec: this._periodMsec()
      }

      this.pitchBuffer = []
      this.currentNoteStartTime += this._periodMsec()
      return true
    }

    return false
  }

  stop () {
    this.pitchBuffer = []
  }

  getLatestNote () {
    return this.latestNote
  }

  // Private methods

  _canOutputNewNote () {
    const time = Date.now()
    return this._numberOfNotesInInterval(this.currentNoteStartTime, time) > 0
  }

  _periodMsec () {
    const periodMsec = 1000.0 * (60 / this.noteBpm)
    return periodMsec
  }

  _numberOfNotesInInterval (timeStart, timeEnd) {
    const timeDifference = timeEnd - timeStart
    const numNotesRational = timeDifference / this._periodMsec()
    if (numNotesRational <= 0) {
      return 0
    }
    return Math.floor(numNotesRational)
  }

  _calculateRepresentativeNotePitch () {
    let total = 0
    this.pitchBuffer.forEach((pitch) => {
      total += pitch
    })
    total /= this.pitchBuffer.length
    return total
  }
}
