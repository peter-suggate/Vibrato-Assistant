// self.importScripts('../detectPitch', 'detect-pitch', './Consts');
import detectPitchMPM from '../detect-pitch'
import detectPitch from 'detect-pitch'
import {
  pitchToNoteNamePlusOffset
} from 'lib/audio/audio-processing'
import {
  AUDIO_PROCESSOR_INIT_MESSAGE,
  AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
  AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE
} from './consts'
import {
  CALC_MPM,
  CALC_AUTO_CORRELATION,
  PITCH_DETECTION_WINDOW_LENGTH,
  PITCH_DETECTION_NUM_OVERLAPPED_REGIONS_PER_UPDATE
} from 'app-consts'

const MEDIAN_FILTER_SIZE = 3

let audioProcessor = null

export default class AudioProcessorWorker
{
  constructor (audioSampleRate) {
    // this.audioData = [];
    // this.pitchData = [];
    this.audioSampleRate = audioSampleRate

    this.medianFilter = []

    this.overlappedAudioData = []
  }

  calculateVolumeLevel (dataArray) {
    const len = dataArray.length
    let total = 0
    let idx = 0
    let rms = 0
    while (idx < len) {
      total += Math.abs(dataArray[idx++])
    }
    rms = Math.sqrt(total / len)
    return rms
  }

  medianFilterPitch (newPitch) {
    const pitch = newPitch
    if (this.medianFilter.length === MEDIAN_FILTER_SIZE) {
      // if (pitch < 0) {
      //   // console.log(pitch);
      //   pitch = this.medianFilter[this.medianFilter.length - 1];
      // }
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

    this.medianFilter.push(pitch)
    if (this.medianFilter.length > MEDIAN_FILTER_SIZE) {
      this.medianFilter.shift()
    }

    const sortedPitches = this.medianFilter.slice(0)
    sortedPitches.sort((aVal, bVal) => { return aVal - bVal })
    return sortedPitches[Math.floor(sortedPitches.length / 2)]
  }

  findAndSetOffset (pitchAndOffset) {
    // Calculate the offset from the true note (in cents).
    if (pitchAndOffset !== null) {
      const note = pitchToNoteNamePlusOffset(pitchAndOffset.pitch)
      if (note) {
        pitchAndOffset.offsetCents = note.offset
      }
    }
  }

  _addOverlappedAudioData (dataArray) {
    this.overlappedAudioData = this.overlappedAudioData.concat(...dataArray)
    const len = this.overlappedAudioData.length
    if (len > PITCH_DETECTION_WINDOW_LENGTH) {
      this.overlappedAudioData = this.overlappedAudioData.slice(PITCH_DETECTION_WINDOW_LENGTH - len)
    }
  }

  _addAudioData (dataArray) {
    const latestPitchAndOffsetCentsMPM = {pitch: 0, offsetCents: 0}
    const latestPitchAndOffsetCents = {pitch: 0, offsetCents: 0}
    const {audioSampleRate} = this

    this._addOverlappedAudioData(dataArray)

    if (CALC_MPM) {
      latestPitchAndOffsetCentsMPM.pitch = detectPitchMPM(this.overlappedAudioData, audioSampleRate)
      latestPitchAndOffsetCentsMPM.pitch = this.medianFilterPitch(latestPitchAndOffsetCentsMPM.pitch)

      this.findAndSetOffset(latestPitchAndOffsetCentsMPM)
    }

    if (CALC_AUTO_CORRELATION) {
      const latestPeriod = detectPitch(this.overlappedAudioData)
      if (latestPeriod > 0) {
        latestPitchAndOffsetCents.pitch = audioSampleRate / latestPeriod
        latestPitchAndOffsetCents.pitch = this.medianFilterPitch(latestPitchAndOffsetCents.pitch)
      }

      this.findAndSetOffset(latestPitchAndOffsetCents)
    }

    // Return the data back to the host thread.
    self.postMessage({
      messageId: AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE,
      pitchAndOffsetCentsMPM: latestPitchAndOffsetCentsMPM,
      pitchAndOffsetCents: latestPitchAndOffsetCents,
      volume: this.calculateVolumeLevel(dataArray)
    })
  }

  addAudioData (dataArray) {
    const CHUNK_SIZE = dataArray.length / PITCH_DETECTION_NUM_OVERLAPPED_REGIONS_PER_UPDATE

    for (let index = 0; index < PITCH_DETECTION_NUM_OVERLAPPED_REGIONS_PER_UPDATE; index++) {
      this._addAudioData(dataArray.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE))
    }
  }
}

self.addEventListener('message', function onMessage (messageEvent) {
  const {data} = messageEvent
  const {messageId} = data
  switch (messageId) {
    case AUDIO_PROCESSOR_INIT_MESSAGE:
      audioProcessor = new AudioProcessorWorker(data.sampleRate)
      break
    case AUDIO_PROCESSOR_ADD_DATA_MESSAGE:
      audioProcessor.addAudioData(data.audioData)
      break
    default:
      throw Error(`Unexpected message sent to AudioProcessor worker: ${messageId}`)
  }
}, false)
