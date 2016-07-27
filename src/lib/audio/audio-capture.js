import {
  AUDIO_PROCESSOR_INIT_MESSAGE,
  AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
  AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE
} from './audio-processor-worker/consts'

import {
  SCRIPT_PROCESSOR_SAMPLES_SIZE,
  CALC_AUTO_CORRELATION,
  PERFORM_FREQUENCY_ANALYSIS,
  FREQUENCY_ANALYSIS_FFT_SIZE
} from 'app-consts'

const isNode = require('detect-node')

let Worker = null
if (!isNode) {
  Worker = require('worker?inline!lib/audio/audio-processor-worker/worker')
}

let audioContext = null
let audioInput = null
let realAudioInput = null
let inputPoint = null
let analyserNode = null
let scriptNode = null
let audioProcessorWorker = null
let onPitchDataArrivedCallback = null
let onPitchDataMPMArrivedCallback = null
let onTimeDataArrivedCallback = null

let fakeIndex = 0
const FAKE_HZ_START = 220
const USE_FAKE_RAW_DATA = false

let freqIndex = 0

function fakeFrequency () {
  freqIndex++
  return FAKE_HZ_START + 0.001 * freqIndex
}

function initAudioContext () {
  if (typeof AudioContext !== 'undefined') {
    audioContext = new AudioContext()
  } else {
    throw new Error('AudioContext not supported. :(')
  }
}

export function registerOnPitchDataArrivedCallback (callback) {
  onPitchDataArrivedCallback = callback
}

export function registerOnPitchDataMPMArrivedCallback (callback) {
  onPitchDataMPMArrivedCallback = callback
}

export function registerOnTimeDataArrivedCallback (callback) {
  onTimeDataArrivedCallback = callback
}

function convertToMono (input) {
  const splitter = audioContext.createChannelSplitter(2)
  const merger = audioContext.createChannelMerger(2)

  input.connect(splitter)
  splitter.connect(merger, 0, 0)
  splitter.connect(merger, 0, 1)
  return merger
}

let currentRandom = 0
let prevAccum = 0
let currentAccum = 0
let fakeIndexModulo = 0

function createScriptNode () {
  scriptNode = audioContext.createScriptProcessor(SCRIPT_PROCESSOR_SAMPLES_SIZE, 1, 1)
  scriptNode.onaudioprocess = function onAudioProcess (audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    const inputBuffer = audioProcessingEvent.inputBuffer
    const inputData = inputBuffer.getChannelData(0)

    if (USE_FAKE_RAW_DATA) {
      const fakeData = []
      const sampleLength = 1.0 / audioContext.sampleRate
      inputData.forEach(() => {
        const rand = currentRandom
        fakeIndexModulo = (fakeIndex % 100)
        if (fakeIndexModulo === 0) {
          currentRandom = 0.05 * Math.random()
          prevAccum = 0 // currentAccum;
        }
        const amp = (0.0 * Math.random() + 0.1)
        currentAccum = prevAccum + Math.sin(2 * Math.PI * fakeIndexModulo * sampleLength * fakeFrequency() + rand)
        fakeData.push(amp * currentAccum)
        fakeIndex++
      })

      onTimeDataArrivedCallback(fakeData)

      audioProcessorWorker.postMessage({
        messageId: AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
        audioData: fakeData}
        )
    } else {
      onTimeDataArrivedCallback(inputData)

      audioProcessorWorker.postMessage({
        messageId: AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
        audioData: inputData}
        )
    }
  }
}

export function getLatestFrequencyData () {
  if (!analyserNode) {
    return []
  }

  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyserNode.getByteFrequencyData(dataArray)
  return dataArray
}

function gotStream (stream) {
  inputPoint = audioContext.createGain()

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream)
  audioInput = realAudioInput
  // audioInput.connect(inputPoint);

  audioInput = convertToMono(audioInput)
  audioInput.connect(inputPoint)

  if (PERFORM_FREQUENCY_ANALYSIS) {
    analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = FREQUENCY_ANALYSIS_FFT_SIZE
    inputPoint.connect(analyserNode)
  }

  createScriptNode()
  audioInput.connect(scriptNode)

  scriptNode.connect(audioContext.destination)

  audioProcessorWorker = new Worker()

  audioProcessorWorker.postMessage({
    messageId: AUDIO_PROCESSOR_INIT_MESSAGE,
    sampleRate: audioContext.sampleRate}
    )

  audioProcessorWorker.addEventListener('message', function onMessage (messageEvent) {
    const {data} = messageEvent
    const {messageId} = data
    switch (messageId) {
      case AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE:
        if (onPitchDataArrivedCallback) {
          if (PERFORM_FREQUENCY_ANALYSIS) {
            const dataArray = getLatestFrequencyData()
            const len = dataArray.length
            // let bucketFreq = 0;
            const bucketFreqStride = audioContext.sampleRate / len
            let tallestBucketIndex = 0
            let tallestBucketAmp = 0
            // let index = 0;
            const MIN_INDEX = len / 50
            dataArray.forEach((amp, index) => {
              if (amp >= tallestBucketAmp && index > MIN_INDEX) {
                tallestBucketIndex = index
                tallestBucketAmp = amp
              }
              // index++;
            })
            const pitch = tallestBucketIndex * bucketFreqStride * 0.5
            onPitchDataArrivedCallback({
              pitch,
              offsetCents: 0
            }, data.volume)
          } else if (CALC_AUTO_CORRELATION) {
            onPitchDataArrivedCallback(data.pitchAndOffsetCents, data.volume)
          }
        }
        if (onPitchDataMPMArrivedCallback) {
          onPitchDataMPMArrivedCallback(data.pitchAndOffsetCentsMPM, data.volume)
        }
        break
      default:
        throw Error(`Unhandled message sent from AudioProcessorWorker: ${messageId}`)
    }
  }, false)
}

function hasGetUserMedia () {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia)
}

export function microphoneAvailable () {
  if (hasGetUserMedia()) {
    // Good to go!
    return true
  }

  // alert('getUserMedia() is not supported in your browser');
  return false
}

export function beginAudioRecording () {
  if (audioContext !== null) {
    audioContext.resume()
    return
  }

  if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
  }

  navigator.getUserMedia(
    {
      'audio': {
        'mandatory': {
          'googEchoCancellation': 'false',
          'googAutoGainControl': 'false',
          'googNoiseSuppression': 'false',
          'googHighpassFilter': 'false'
        },
        'optional': []
      }
    }, gotStream, function onError (ex) {
      alert('Error getting audio')
      console.log(ex)
    })

  initAudioContext()
}

export function stopAudioRecording () {
  if (audioContext) {
    audioContext.suspend()
  }
}
