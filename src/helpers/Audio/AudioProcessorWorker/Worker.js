// self.importScripts('../detectPitch', 'detect-pitch', './Consts');
import detectPitchMPM from '../detectPitch';
import detectPitch from 'detect-pitch';
import {
  pitchToNoteNamePlusOffset
} from 'helpers/Audio/AudioProcessing';
import {
  AUDIO_PROCESSOR_INIT_MESSAGE,
  AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
  AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE
} from './Consts';

const USE_MPM = true; // The McLeod pitch method.

let audioProcessor = null;

export default class AudioProcessorWorker
{
  constructor(audioSampleRate) {
    this.audioData = [];
    this.pitchData = [];
    this.audioSampleRate = audioSampleRate;
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

    // Calculate the offset from the true note (in cents).
    if (latestPitchAndOffsetCents !== null) {
      const note = pitchToNoteNamePlusOffset(latestPitchAndOffsetCents.pitch);
      if (note) {
        latestPitchAndOffsetCents.offsetCents = note.offset;
      }
    }

    this.pitchData.push(latestPitchAndOffsetCents);

    // Return the data back to the host thread.
    self.postMessage({
      messageId: AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE,
      pitchAndOffsetCents: this.pitchData[this.pitchData.length - 1]
    });
  }

  getLatestPitches(fromIndex) {
    const {pitchData} = this;

    if (pitchData.length === 0 || pitchData.length <= fromIndex) {
      return null;
    }

    return pitchData[fromIndex];
  }

  getNumberOfPitches() {
    return this.pitchData.length;
  }
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
