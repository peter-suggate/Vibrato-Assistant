
/*
 * Implementation of MPM adapted from the Tarsos DSP project
 *
 * https://github.com/JorenSix/TarsosDSP
 *
 */

// const DEFAULT_BUFFER_SIZE = 1024;
// const DEFAULT_CUTOFF = 0.97;
const DEFAULT_CUTOFF = 0.97;
const SMALL_CUTOFF = 0.5;
const LOWER_PITCH_CUTOFF = 20.0; // Hz
let cutoff;
// let sampleRate;
const nsdf = [];
let turningPointX;
let turningPointY;
let maxPositions = [];
let periodEstimates = [];
let ampEstimates = [];

// public MPM(const audioSampleRate) {
//   this(audioSampleRate, DEFAULT_BUFFER_SIZE, DEFAULT_CUTOFF);
// }

//     public MPM(const audioSampleRate, final int audioBufferSize) {
//   this(audioSampleRate, audioBufferSize, DEFAULT_CUTOFF);
// }

//     public MPM(const audioSampleRate, final int audioBufferSize, const cutoffMPM) {
//   this.sampleRate = audioSampleRate;
//   nsdf = new double[audioBufferSize];
//   this.cutoff = cutoffMPM;
// }

function normalizedSquareDifference(audioBuffer) {
  for (let tau = 0; tau < audioBuffer.length; tau++) {
    let acf = 0;
    let divisorM = 0;
    for (let idx = 0; idx < audioBuffer.length - tau; idx++) {
      acf += audioBuffer[idx] * audioBuffer[idx + tau];
      divisorM += audioBuffer[idx] * audioBuffer[idx] + audioBuffer[idx + tau] * audioBuffer[idx + tau];
    }
    nsdf[tau] = 2 * acf / divisorM;
  }
}

function prabolicInterpolation(tau) {
  const nsdfa = nsdf[tau - 1];
  const nsdfb = nsdf[tau];
  const nsdfc = nsdf[tau + 1];
  const bValue = tau;
  const bottom = nsdfc + nsdfa - 2 * nsdfb;
  if (bottom === 0.0) {
    turningPointX = bValue;
    turningPointY = nsdfb;
  } else {
    const delta = nsdfa - nsdfc;
    turningPointX = bValue + delta / (2 * bottom);
    turningPointY = nsdfb - delta * delta / (8 * bottom);
  }
}

function peakPicking() {
  let pos = 0;
  let curMaxPos = 0;

  // find the first negative zero crossing
  while (pos < (nsdf.length - 1) / 3 && nsdf[pos] > 0) {
    pos++;
  }

  // loop over all the values below zero
  while (pos < nsdf.length - 1 && nsdf[pos] <= 0.0) {
    pos++;
  }

  // can happen if output[0] is NAN
  if (pos === 0) {
    pos = 1;
  }

  while (pos < nsdf.length - 1) {
    // assert nsdf[pos] >= 0;
    if (nsdf[pos] > nsdf[pos - 1] && nsdf[pos] >= nsdf[pos + 1]) {
      if (curMaxPos === 0) {
        // the first max (between zero crossings)
        curMaxPos = pos;
      } else if (nsdf[pos] > nsdf[curMaxPos]) {
        // a higher max (between the zero crossings)
        curMaxPos = pos;
      }
    }
    pos++;
    // a negative zero crossing
    if (pos < nsdf.length - 1 && nsdf[pos] <= 0) {
      // if there was a maximum add it to the list of maxima
      if (curMaxPos > 0) {
        maxPositions.push(curMaxPos);
        curMaxPos = 0; // clear the maximum position, so we start
        // looking for a new ones
      }
      while (pos < nsdf.length - 1 && nsdf[pos] <= 0.0) {
        pos++; // loop over all the values below zero
      }
    }
  }
  if (curMaxPos > 0) { // if there was a maximum in the last part
    maxPositions.push(curMaxPos); // add it to the vector of maxima
  }
}

export default function detectPitch(audioBuffer, sampleRate) {
  if (audioBuffer.length > nsdf.length) {
    nsdf.length = audioBuffer.length;
  }
  cutoff = DEFAULT_CUTOFF;

  let pitch;

  // 0. Clear previous results (Is this faster than initializing a list
  // again and again?)
  maxPositions = [];
  periodEstimates = [];
  ampEstimates = [];

  // 1. Calculate the normalized square difference for each Tau value.
  normalizedSquareDifference(audioBuffer);
  // 2. Peak picking time: time to pick some peaks.
  peakPicking();

  let highestAmplitude = Number.NEGATIVE_INFINITY;

  maxPositions.forEach(tau => {
    // make sure every annotation has a probability attached
    highestAmplitude = Math.max(highestAmplitude, nsdf[tau]);

    if (nsdf[tau] > SMALL_CUTOFF) {
      // calculates turningPointX and Y
      prabolicInterpolation(tau);
      // store the turning points
      ampEstimates.push(turningPointY);
      periodEstimates.push(turningPointX);
      // remember the highest amplitude
      highestAmplitude = Math.max(highestAmplitude, turningPointY);
    }
  });

  if (periodEstimates.length === 0) {
    pitch = -1;
  } else {
    // use the overall maximum to calculate a cutoff.
    // The cutoff value is based on the highest value and a relative
    // threshold.
    const actualCutoff = cutoff * highestAmplitude;

    // find first period above or equal to cutoff
    const periodIndex = ampEstimates.findIndex(ampEstimate => {
      if (ampEstimate >= actualCutoff) {
        return true;
      }
    });

    const period = periodEstimates[periodIndex];
    const pitchEstimate = (sampleRate / period);
    if (pitchEstimate > LOWER_PITCH_CUTOFF) {
      pitch = pitchEstimate;
    } else {
      pitch = -1;
    }
  }

  return pitch;
}
