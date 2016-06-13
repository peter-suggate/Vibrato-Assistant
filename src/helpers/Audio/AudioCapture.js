// import detectPitchMPM from './detectPitch';
// import detectPitch from 'detect-pitch';
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

// import AudioProcessorWorker from './AudioProcessorWorker/Worker';

// import AsyncTask from 'async-task';
// import BackgroundWorker from 'background-worker';

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

// main.js
// const AudioProcessorWorker = require('worker!./AudioProcessorWorker/Worker');

// var worker = new MyWorker();
// worker.postMessage({a: 1});
// worker.onmessage = function(event) {...};
// worker.addEventListener("message", function(event) {...});


let firstAudioDataReceived = false;
let audioContext = null;
let audioInput = null;
let realAudioInput = null;
let inputPoint = null;
let analyserNode = null;
// let timeDomainDataArray = null;
// let latestPitch = 0;
let scriptNode = null;
// let audioProcessor = null;
let audioProcessorWorker = null;
// let audioProcessorTask = null;
let onPitchDataArrivedCallback = null;
// let lastReturnedPitchIndex = 0;
// const pitches = [];
// const medianFilter = [];
// const MEDIAN_FILTER_LENGTH = 9;
const FFT_SIZE = 256;
const SCRIPT_PROCESSOR_SAMPLES_SIZE = 4 * FFT_SIZE;

// const useMPM = true;
// let unprocessedRecordedData = [];

function initAudioContext() {
  if (typeof AudioContext !== `undefined`) {
    audioContext = new AudioContext();
  } else {
    throw new Error(`AudioContext not supported. :(`);
  }
}


// function gotBuffers( buffers ) {
//     var canvas = document.getElementById( `wavedisplay` );

//     drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

//     // the ONLY time gotBuffers is called is right after a new recording is completed -
//     // so here's where we should set up the download.
//     audioRecorder.exportWAV( doneEncoding );
// }

// function doneEncoding( blob ) {
//     Recorder.setupDownload( blob, `myRecording` + ((recIndex<10)?`0`:``) + recIndex + `.wav` );
//     recIndex++;
// }

// function toggleRecording( e ) {
//     if (e.classList.contains(`recording`)) {
//         // stop recording
//         audioRecorder.stop();
//         e.classList.remove(`recording`);
//         audioRecorder.getBuffers( gotBuffers );
//     } else {
//         // start recording
//         if (!audioRecorder)
//             return;
//         e.classList.add(`recording`);
//         audioRecorder.clear();
//         audioRecorder.record();
//     }
// }

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

    // audioProcessorWorker.run('processAudioData', [inputData]).then((resultPitch) => {
    //   if (onPitchDataArrivedCallback) {
    //     onPitchDataArrivedCallback(resultPitch);
    //   }
    // });
    audioProcessorWorker.postMessage({
      messageId: AUDIO_PROCESSOR_ADD_DATA_MESSAGE,
      audioData: inputData}
      );

    // // // The output buffer contains the samples that will be modified and played
    // // var outputBuffer = audioProcessingEvent.outputBuffer;

    // // Loop through the output channels (in this case there is only one)
    // for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    //   var outputData = outputBuffer.getChannelData(channel);

    //   // Loop through the 4096 samples
    //   for (var sample = 0; sample < inputBuffer.length; sample++) {
    //     // make output equal to the same as the input
    //     outputData[sample] = inputData[sample];

    //     // add noise to each output sample
    //     outputData[sample] += ((Math.random() * 2) - 1) * 0.2;
    //   }
    // }
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

  // audioRecorder = new Recorder(inputPoint);

  // const zeroGain = audioContext.createGain();
  // zeroGain.gain.value = 0.0;
  // inputPoint.connect(zeroGain);
  // zeroGain.connect(audioContext.destination);
  scriptNode.connect(audioContext.destination);

  // audioProcessor = new AudioProcessorWorker(audioContext.sampleRate);// new Worker('AudioProcessorWorker.js');
  audioProcessorWorker = new Worker;
  // audioProcessorWorker = new BackgroundWorker({workerData: audioProcessor});
  // audioProcessorWorker.define('processAudioData', (args) => {
  //   importScripts('./detectPitch');
  //   // console.log(workerData, args);
  //   // const theAudioProcessor = workerData;
  //   const audioSamples = args[0];
  //   const audioSampleRate = args[1];

  //   const pitch = detectPitchMPM(audioSamples, audioSampleRate);

  //   // audioProcessor.addAudioData(audioSamples);
  //   // onPitchDataArrivedCallback(audioProcessor.getLatestPitches(lastReturnedPitchIndex));
  //   // lastReturnedPitchIndex = audioProcessor.getNumberOfPitches();
  //   return pitch;
  // });
  // audioProcessorTask = new AsyncTask({
  //   doInBackground: () => {
  //     for (let asd = 1; asd < 2000; ++asd) {
  //       console.log('Waiting for audio to be recorded asynchronously');
  //     }
  //     for (;;) {
  //       console.log('Waiting for audio to be recorded asynchronously');
  //       if (unprocessedRecordedData.length > 0) {
  //         audioProcessorWorker.addAudioData(unprocessedRecordedData);
  //         unprocessedRecordedData = [];
  //         console.log('Adding data asynchronously');
  //         onPitchDataArrivedCallback(audioProcessorWorker.getLatestPitches(lastReturnedPitchIndex));
  //         lastReturnedPitchIndex = audioProcessorWorker.getNumberOfPitches();
  //       }
  //     }
  //   }
  // });

  // audioProcessorTask.execute();

  audioProcessorWorker.postMessage({
    messageId: AUDIO_PROCESSOR_INIT_MESSAGE,
    sampleRate: audioContext.sampleRate}
    );

  audioProcessorWorker.addEventListener('message', function onMessage(messageEvent) {
    const {data} = messageEvent;
    const {messageId} = data;
    switch (messageId) {
      case AUDIO_PROCESSOR_RETURN_LATEST_PITCH_DATA_MESSAGE:
        // pitches.push(data.pitchData);
        if (onPitchDataArrivedCallback) {
          onPitchDataArrivedCallback(data.pitchAndOffsetCents);
        }
        break;
      default:
        throw Error(`Unhandled message sent from AudioProcessorWorker: ${messageId}`);
    }

    // console.log('Worker said: ', messageEvent.data);
  }, false);

  firstAudioDataReceived = true;
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

  //  updateCallbackFunc = updateCallback;

  if (!navigator.getUserMedia) {
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  }

  initAudioContext();

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
}

export function stopAudioRecording() {
  // window.cancelAnimationFrame(rafID);
  // rafID = null;
  if (audioContext) {
    audioContext.suspend();
  }
}

export function getLatestFrequencyData() {
  if (!firstAudioDataReceived) {
    return [];
  }

  // analyzer draw code here
  // var SPACING = 3;
  // var BAR_WIDTH = 1;
  // var numBars = Math.round(canvasWidth / SPACING);
  const numBars = 64;
  const freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

  analyserNode.getByteFrequencyData(freqByteData);

  // analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
  // analyserContext.fillStyle = '#F6D565';
  // analyserContext.lineCap = 'round';
  const multiplier = analyserNode.frequencyBinCount / numBars;

  const magnitudes = [];

  // Draw rectangle for each frequency bin.
  for (let bar = 0; bar < numBars; ++bar) {
    let magnitude = 0;
    const offset = Math.floor(bar * multiplier);
    // gotta sum/average the block, or we miss narrow-bandwidth spikes
    for (let mult = 0; mult < multiplier; mult++) {
      magnitude += freqByteData[offset + mult];
    }
    magnitude = magnitude / multiplier;
    const magnitude2 = freqByteData[bar * multiplier];
    magnitudes.push(magnitude2);
    // analyserContext.fillStyle = `hsl( ` + Math.round((i * 360) / numBars) + `, 100%, 50%)`;
    // analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
  }

  return magnitudes;
}

// export function getLatestPitch() {
//   if (!firstAudioDataReceived) {
//     return null;
//   }

//   const numSamples = analyserNode.fftSize;
//   if (timeDomainDataArray === null) {
//     timeDomainDataArray = new Float32Array(numSamples);
//   }
//   analyserNode.getFloatTimeDomainData(timeDomainDataArray);

//   if (useMPM) {
//     latestPitch = detectPitchMPM(timeDomainDataArray, audioContext.sampleRate);
//   } else {
//     const latestPeriod = detectPitch(timeDomainDataArray);
//     if (latestPeriod > 0) {
//       latestPitch = audioContext.sampleRate / latestPeriod;
//     } else {
//       latestPitch = 0;
//     }
//   }

//   medianFilter.push(latestPitch);
//   if (medianFilter.length > MEDIAN_FILTER_LENGTH) {
//     medianFilter.shift();
//   }
//   const sortedFilter = medianFilter.slice(0);
//   sortedFilter.sort((vala, valb) => {
//     return vala - valb;
//   });
//   const medianLength = sortedFilter.length;
//   return sortedFilter[Math.floor(medianLength / 2)];

//   // return latestPitch;
// }
