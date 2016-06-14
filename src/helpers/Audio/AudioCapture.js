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

const FFT_SIZE = 256;
const SCRIPT_PROCESSOR_SAMPLES_SIZE = 4 * FFT_SIZE;

let audioContext = null;
let audioInput = null;
let realAudioInput = null;
let inputPoint = null;
let analyserNode = null;
let scriptNode = null;
let audioProcessorWorker = null;
let onPitchDataArrivedCallback = null;

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

function gotStream(stream) {
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  // audioInput.connect(inputPoint);

  audioInput = convertToMono(audioInput);
  audioInput.connect(inputPoint);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = FFT_SIZE;
  inputPoint.connect(analyserNode);

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
          onPitchDataArrivedCallback(data.pitchAndOffsetCents, data.volume);
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
