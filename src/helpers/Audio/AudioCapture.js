import {
  AUDIO_PROCESSOR_INIT_MESSAGE,
  AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
  AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE
} from './AudioProcessorWorker/Consts';

const isNode = require('detect-node');

let Worker = null;
if (!isNode) {
  Worker = require('worker?inline!helpers/Audio/AudioProcessorWorker/Worker');
}

// const FFT_SIZE = 512;
// const SCRIPT_PROCESSOR_SAMPLES_SIZE = 2 * FFT_SIZE;
const FFT_SIZE = 2048;
const SCRIPT_PROCESSOR_SAMPLES_SIZE = 1024;

const CALC_AUTO_CORRELATION = false;
const FREQUENCY_ANALYSIS = false;

let audioContext = null;
let audioInput = null;
let realAudioInput = null;
let inputPoint = null;
let analyserNode = null;
let scriptNode = null;
let audioProcessorWorker = null;
let onPitchDataArrivedCallback = null;
let onPitchDataMPMArrivedCallback = null;

function initAudioContext() {
  if (typeof AudioContext !== `undefined`) {
    audioContext = new AudioContext();
  } else {
    throw new Error(`AudioContext not supported. :(`);
  }
}

export function registerOnPitchDataArrivedCallback(callback) {
  onPitchDataArrivedCallback = callback;
}

export function registerOnPitchDataMPMArrivedCallback(callback) {
  onPitchDataMPMArrivedCallback = callback;
}

function convertToMono(input) {
  const splitter = audioContext.createChannelSplitter(2);
  const merger = audioContext.createChannelMerger(2);

  input.connect(splitter);
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 0, 1);
  return merger;
}

function createScriptNode() {
  scriptNode = audioContext.createScriptProcessor(SCRIPT_PROCESSOR_SAMPLES_SIZE, 1, 1);
  scriptNode.onaudioprocess = function onAudioProcess(audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    const inputBuffer = audioProcessingEvent.inputBuffer;
    const inputData = inputBuffer.getChannelData(0);

    audioProcessorWorker.postMessage({
      messageId: AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
      audioData: inputData}
      );
  };
}

export function getLatestFrequencyData() {
  if (!analyserNode) {
    return [];
  }

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);
  return dataArray;
}

function gotStream(stream) {
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  // audioInput.connect(inputPoint);

  audioInput = convertToMono(audioInput);
  audioInput.connect(inputPoint);

  if (FREQUENCY_ANALYSIS) {
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = FFT_SIZE;
    inputPoint.connect(analyserNode);
  }

  createScriptNode();
  audioInput.connect(scriptNode);

  scriptNode.connect(audioContext.destination);

  audioProcessorWorker = new Worker;

  audioProcessorWorker.postMessage({
    messageId: AUDIO_PROCESSOR_INIT_MESSAGE,
    sampleRate: audioContext.sampleRate}
    );

  audioProcessorWorker.addEventListener('message', function onMessage(messageEvent) {
    const {data} = messageEvent;
    const {messageId} = data;
    switch (messageId) {
      case AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE:
        if (onPitchDataArrivedCallback) {
          if (FREQUENCY_ANALYSIS) {
            const dataArray = getLatestFrequencyData();
            const len = dataArray.length;
            // let bucketFreq = 0;
            const bucketFreqStride = audioContext.sampleRate / len;
            let tallestBucketIndex = 0;
            let tallestBucketAmp = 0;
            // let index = 0;
            const MIN_INDEX = len / 50;
            dataArray.forEach((amp, index) => {
              if (amp >= tallestBucketAmp && index > MIN_INDEX) {
                tallestBucketIndex = index;
                tallestBucketAmp = amp;
              }
              // index++;
            });
            const pitch = tallestBucketIndex * bucketFreqStride * 0.5;
            onPitchDataArrivedCallback({
              pitch,
              offsetCents: 0
            }, data.volume);
          } else if (CALC_AUTO_CORRELATION) {
            onPitchDataArrivedCallback(data.pitchAndOffsetCents, data.volume);
          }
        }
        if (onPitchDataMPMArrivedCallback) {
          onPitchDataMPMArrivedCallback(data.pitchAndOffsetCentsMPM, data.volume);
        }
        break;
      default:
        throw Error(`Unhandled message sent from AudioProcessorWorker: ${messageId}`);
    }
  }, false);
}

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

export function microphoneAvailable() {
  if (hasGetUserMedia()) {
    // Good to go!
    return true;
  }

  // alert('getUserMedia() is not supported in your browser');
  return false;
}

export function beginAudioRecording() {
  if (audioContext !== null) {
    audioContext.resume();
    return;
  }

  if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  }

  navigator.getUserMedia(
    {
      'audio': {
        'mandatory': {
          'googEchoCancellation': `false`,
          'googAutoGainControl': `false`,
          'googNoiseSuppression': `false`,
          'googHighpassFilter': `false`
        },
        'optional': []
      },
    }, gotStream, function onError(ex) {
      alert('Error getting audio');
      console.log(ex);
    });

  initAudioContext();
}

export function stopAudioRecording() {
  if (audioContext) {
    audioContext.suspend();
  }
}
