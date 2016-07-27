import {
  MIN_RECOGNISABLE_PITCH
} from 'lib/audio/audio-processing'

const NICE_SCALING_INTERP_SPEED = 0.05
const NICE_SCALING_INTERP_SPEED_INV = 1 - NICE_SCALING_INTERP_SPEED

export default class PitchPlotScaling {
  constructor (logScaling, initialMin, initialMax, windowWidthMs, scalingPadFreq) {
    this.logScaling = logScaling
    if (this.logScaling) {
      this.pitchMin = Math.log2(initialMin)
      this.pitchMax = Math.log2(initialMax)
    } else {
      this.pitchMin = initialMin
      this.pitchMax = initialMax
    }
    this.windowWidthMs = windowWidthMs
    this.scalingPadFreq = scalingPadFreq

    this.nicePitchRange = { min: this.pitchMin, max: this.pitchMax }
  }

  getMin () {
    return this.pitchMin
  }

  getMax () {
    return this.pitchMax
  }

  updateVerticalScaling (pitchesAndTimes) {
    this._updateNiceVerticalScaling(pitchesAndTimes)

    this.pitchMin = NICE_SCALING_INTERP_SPEED_INV * this.pitchMin + NICE_SCALING_INTERP_SPEED * this.nicePitchRange.min
    this.pitchMax = NICE_SCALING_INTERP_SPEED_INV * this.pitchMax + NICE_SCALING_INTERP_SPEED * this.nicePitchRange.max
  }

  linearInterpolate (val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin)
    return toMin + tmp * (toMax - toMin)
  }

  scale (pitch, containerHeightInPixels) {
    let thePitch = pitch
    if (this.logScaling) {
      thePitch = Math.log2(pitch)
    }

    return this.linearInterpolate(
      thePitch,
      this.getMin(), this.getMax(),
      0, containerHeightInPixels
    )
  }

  _findPitchInRange (pitchesAndTimes, withinLastMs) {
    if (pitchesAndTimes.length === 0) {
      return null
    }

    const numPitches = pitchesAndTimes.length
    const latestTime = pitchesAndTimes[numPitches - 1].timeMsec
    let maxPitch = -Number.MAX_VALUE
    let minPitch = Number.MAX_VALUE
    let foundOne = false
    for (let idx = numPitches - 1; idx >= 0; --idx) {
      const {pitch, timeMsec} = pitchesAndTimes[idx]
      if (latestTime - timeMsec > withinLastMs) {
        break
      }
      if (pitch <= MIN_RECOGNISABLE_PITCH) {
        continue
      }

      let thePitch = pitch
      if (this.logScaling) {
        thePitch = Math.log2(pitch)
      }
      maxPitch = Math.max(thePitch, maxPitch)
      minPitch = Math.min(thePitch, minPitch)
      foundOne = true
    }

    if (!foundOne) {
      return null
    }

    return { min: minPitch, max: maxPitch }
  }

  _updateNiceVerticalScaling (pitchesAndTimes) {
    const {windowWidthMs, scalingPadFreq} = this
    const newPitchRange = this._findPitchInRange(pitchesAndTimes, windowWidthMs)
    if (newPitchRange !== null) {
      // Pad the range a bit.
      newPitchRange.min -= scalingPadFreq
      newPitchRange.max += scalingPadFreq

      // To ensure a more stable animation, be slightly reluctant to zoom index unless the
      // difference gets too large.
      if (newPitchRange.min < this.nicePitchRange.min || newPitchRange.min > this.nicePitchRange.min + scalingPadFreq) {
        this.nicePitchRange.min = newPitchRange.min
      }

      if (newPitchRange.max > this.nicePitchRange.max || newPitchRange.max < this.nicePitchRange.max - scalingPadFreq) {
        this.nicePitchRange.max = newPitchRange.max
      }
    }
  }

}
