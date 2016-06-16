// self.importScripts('../detectPitch', 'detect-pitch', './Consts');
import detectPitchMPM from '../detectPitch';
import detectPitch from 'detect-pitch';
import {
  pitchToNoteNamePlusOffset,
  LOG_OF_DIFFERENCE_BETWEEN_ADJACENT_SEMITONES
} from 'helpers/Audio/AudioProcessing';
import {
  AUDIO_PROCESSOR_INIT_MESSAGE,
  AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
  AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE
} from './Consts';

const USE_MPM = true; // The McLeod pitch method.
const MEDIAN_FILTER_SIZE = 5;

let audioProcessor = null;

export default class AudioProcessorWorker
{
  constructor(audioSampleRate) {
    // this.audioData = [];
    // this.pitchData = [];
    this.audioSampleRate = audioSampleRate;

    this.medianFilter = [];
  }

  calculateVolumeLevel(dataArray) {
    const len = dataArray.length;
    let total = 0;
    let idx = 0;
    let rms = 0;
    while (idx < len) {
      total += Math.abs(dataArray[idx++]);
    }
    rms = Math.sqrt(total / len);
    return rms;
  }

  medianFilterPitch(newPitch) {
    let pitch = newPitch;
    if (this.medianFilter.length === MEDIAN_FILTER_SIZE) {
      if (pitch < 0) {
        // console.log(pitch);
        pitch = this.medianFilter[this.medianFilter.length - 1];
      }
      // else {
      //   const pitchA = Math.log2(pitch);
      //   const pitchB = Math.log2(this.medianFilter[this.medianFilter.length - 1]);
      //   const delta = Math.abs(pitchA - pitchB);
      //   // console.log(delta);
      //   if (delta > 24 * LOG_OF_DIFFERENCE_BETWEEN_ADJACENT_SEMITONES) {
      //     pitch = this.medianFilter[this.medianFilter.length - 1];
      //   }
      // }
    }

    this.medianFilter.push(pitch);
    if (this.medianFilter.length > MEDIAN_FILTER_SIZE) {
      this.medianFilter.shift();
    }

    const sortedPitches = this.medianFilter.slice(0);
    sortedPitches.sort((aVal, bVal) => { return aVal - bVal; });
    return sortedPitches[Math.floor(sortedPitches.length / 2)];
  }

  addAudioData(dataArray) {
    let latestPitchAndOffsetCents = {pitch: 0, offsetCents: 0};
    const {audioSampleRate} = this;
    if (USE_MPM) {
      latestPitchAndOffsetCents.pitch = detectPitchMPM(dataArray, audioSampleRate);
    } else {
      const latestPeriod = detectPitch(dataArray);
      if (latestPeriod > 0) {
        latestPitchAndOffsetCents.pitch = audioSampleRate / latestPeriod;
      } else {
        latestPitchAndOffsetCents = null;
      }
    }

    latestPitchAndOffsetCents.pitch = this.medianFilterPitch(latestPitchAndOffsetCents.pitch);

    // Calculate the offset from the true note (in cents).
    if (latestPitchAndOffsetCents !== null) {
      const note = pitchToNoteNamePlusOffset(latestPitchAndOffsetCents.pitch);
      if (note) {
        latestPitchAndOffsetCents.offsetCents = note.offset;
      }
    }

    // this.pitchData.push(latestPitchAndOffsetCents);

    // Return the data back to the host thread.
    self.postMessage({
      messageId: AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE,
      pitchAndOffsetCents: latestPitchAndOffsetCents,
      volume: this.calculateVolumeLevel(dataArray)
    });
  }

  // getLatestPitches(fromIndex) {
  //   const {pitchData} = this;

  //   if (pitchData.length === 0 || pitchData.length <= fromIndex) {
  //     return null;
  //   }

  //   return pitchData[fromIndex];
  // }

  // getNumberOfPitches() {
  //   return this.pitchData.length;
  // }
}

self.addEventListener('message', function onMessage(messageEvent) {
  const {data} = messageEvent;
  const {messageId} = data;
  switch (messageId) {
    case AUDIO_PROCESSOR_INIT_MESSAGE:
      audioProcessor = new AudioProcessorWorker(data.sampleRate);
      break;
    case AUDIO_PROCESSOR_ADD_DATA_MESSAGE:
      audioProcessor.addAudioData(data.audioData);
      break;
    default:
      throw Error(`Unexpected message sent to AudioProcessor worker: ${messageId}`);
  }
}, false);
