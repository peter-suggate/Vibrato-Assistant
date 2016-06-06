import {
  MIN_RECOGNISABLE_PITCH,
  logOfDifferenceBetweenAdjacentSemitones
} from 'helpers/Audio/AudioProcessing';

const NICE_SCALING_WINDOW_WIDTH_MS = 2000;
const NICE_SCALING_PAD = 10 * logOfDifferenceBetweenAdjacentSemitones();
const NICE_SCALING_INTERP_SPEED = 0.05;
const NICE_SCALING_INTERP_SPEED_INV = 1 - NICE_SCALING_INTERP_SPEED;

export default class PitchPlotScaling {
  constructor(initialMin, initialMax) {
    this.logPitchMin = Math.log2(initialMin);
    this.logPitchMax = Math.log2(initialMax);

    this.nicePitchRange = { min: this.logPitchMin, max: this.logPitchMax };
  }

  logMin() {
    return this.logPitchMin;
  }

  logMax() {
    return this.logPitchMax;
  }

  updateVerticalScaling(pitchesAndTimes) {
    this._updateNiceVerticalScaling(pitchesAndTimes);

    this.logPitchMin = NICE_SCALING_INTERP_SPEED_INV * this.logPitchMin + NICE_SCALING_INTERP_SPEED * this.nicePitchRange.min;
    this.logPitchMax = NICE_SCALING_INTERP_SPEED_INV * this.logPitchMax + NICE_SCALING_INTERP_SPEED * this.nicePitchRange.max;
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return (tmp + toMin) * (toMax - toMin);
  }

  scale(pitch, containerHeightInPixels) {
    const logPitch = Math.log2(pitch);

    return this.linearInterpolate(
      logPitch,
      this.logMin(), this.logMax(),
      0, containerHeightInPixels
    );
  }

  _findPitchInRange(pitchesAndTimes, withinLastMs) {
    if (pitchesAndTimes.length === 0) {
      return null;
    }

    const numPitches = pitchesAndTimes.length;
    const latestTime = pitchesAndTimes[numPitches - 1].timeMsec;
    let maxPitch = -Number.MAX_VALUE;
    let minPitch = Number.MAX_VALUE;
    let foundOne = false;
    for (let idx = numPitches - 1; idx >= 0; --idx) {
      const {pitch, timeMsec} = pitchesAndTimes[idx];
      if (latestTime - timeMsec > withinLastMs) {
        break;
      }
      if (pitch <= MIN_RECOGNISABLE_PITCH) {
        continue;
      }

      const logPitch = Math.log2(pitch);
      maxPitch = Math.max(logPitch, maxPitch);
      minPitch = Math.min(logPitch, minPitch);
      foundOne = true;
    }

    if (!foundOne) {
      return null;
    }

    return { min: minPitch, max: maxPitch };
  }

  _updateNiceVerticalScaling(pitchesAndTimes) {
    const newPitchRange = this._findPitchInRange(pitchesAndTimes, NICE_SCALING_WINDOW_WIDTH_MS);
    if (newPitchRange !== null) {
      // Pad the range a bit.
      newPitchRange.min -= NICE_SCALING_PAD;
      newPitchRange.max += NICE_SCALING_PAD;

      // To ensure a more stable animation, be slightly reluctant to zoom index unless the
      // difference gets too large.
      if (newPitchRange.min < this.nicePitchRange.min || newPitchRange.min > this.nicePitchRange.min + NICE_SCALING_PAD) {
        this.nicePitchRange.min = newPitchRange.min;
      }

      if (newPitchRange.max > this.nicePitchRange.max || newPitchRange.max < this.nicePitchRange.max - NICE_SCALING_PAD) {
        this.nicePitchRange.max = newPitchRange.max;
      }
    }
  }

}
