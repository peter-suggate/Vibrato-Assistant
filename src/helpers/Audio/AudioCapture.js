import detectPitchMPM from './detectPitch';
import detectPitch from 'detect-pitch';

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

let firstAudioDataReceived = false;
let audioContext = null;
let audioInput = null;
let realAudioInput = null;
let inputPoint = null;
let analyserNode = null;
let timeDomainDataArray = null;
let latestPitch = 0;
const medianFilter = [];
const MEDIAN_FILTER_LENGTH = 9;
const useMPM = true;

function initAudioContext() {
  if (typeof AudioContext !== `undefined`) {
    audioContext = new AudioContext();
    // }
    // else if (typeof webkitAudioContext !== `undefined`) {
    // context = new webkitAudioContext();
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

function convertToMono(input) {
  const splitter = audioContext.createChannelSplitter(2);
  const merger = audioContext.createChannelMerger(2);

  input.connect(splitter);
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 0, 1);
  return merger;
}

// function updateAnalysers(time) {
//   if (!analyserContext) {
//     var canvas = document.getElementById(`analyser`);
//     canvasWidth = canvas.width;
//     canvasHeight = canvas.height;
//     analyserContext = canvas.getContext('2d');
//   }

//   // analyzer draw code here
//   {
//     var SPACING = 3;
//     var BAR_WIDTH = 1;
//     var numBars = Math.round(canvasWidth / SPACING);
//     var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

//     analyserNode.getByteFrequencyData(freqByteData);

//     analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
//     analyserContext.fillStyle = '#F6D565';
//     analyserContext.lineCap = 'round';
//     var multiplier = analyserNode.frequencyBinCount / numBars;

//     // Draw rectangle for each frequency bin.
//     for (var i = 0; i < numBars; ++i) {
//       var magnitude = 0;
//       var offset = Math.floor(i * multiplier);
//       // gotta sum/average the block, or we miss narrow-bandwidth spikes
//       for (var j = 0; j < multiplier; j++)
//         magnitude += freqByteData[offset + j];
//       magnitude = magnitude / multiplier;
//       var magnitude2 = freqByteData[i * multiplier];
//       analyserContext.fillStyle = `hsl( ` + Math.round((i * 360) / numBars) + `, 100%, 50%)`;
//       analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
//     }
//   }

//   rafID = window.requestAnimationFrame(updateAnalysers);
// }

// function toggleMono() {
//     if (audioInput != realAudioInput) {
//         audioInput.disconnect();
//         realAudioInput.disconnect();
//         audioInput = realAudioInput;
//     } else {
//         realAudioInput.disconnect();
//         audioInput = convertToMono( realAudioInput );
//     }

//     audioInput.connect(inputPoint);
// }

// function updateLoop() {
//   if (updateCallbackFunc) {
//     updateCallbackFunc();
//   }

//   rafID = window.requestAnimationFrame(updateLoop);
// }

function gotStream(stream) {
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  // audioInput.connect(inputPoint);

  audioInput = convertToMono(audioInput);
  audioInput.connect(inputPoint);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;
  inputPoint.connect(analyserNode);

  // audioRecorder = new Recorder(inputPoint);

  // const zeroGain = audioContext.createGain();
  // zeroGain.gain.value = 0.0;
  // inputPoint.connect(zeroGain);
  // zeroGain.connect(audioContext.destination);
  audioInput.connect(audioContext.destination);

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

export function getLatestPitch() {
  if (!firstAudioDataReceived) {
    return null;
  }

  const numSamples = analyserNode.fftSize;
  if (timeDomainDataArray === null) {
    timeDomainDataArray = new Float32Array(numSamples);
  }
  analyserNode.getFloatTimeDomainData(timeDomainDataArray);

  if (useMPM) {
    latestPitch = detectPitchMPM(timeDomainDataArray, audioContext.sampleRate);
  } else {
    const latestPeriod = detectPitch(timeDomainDataArray);
    if (latestPeriod > 0) {
      latestPitch = audioContext.sampleRate / latestPeriod;
    } else {
      latestPitch = 0;
    }
  }

  medianFilter.push(latestPitch);
  if (medianFilter.length > MEDIAN_FILTER_LENGTH) {
    medianFilter.shift();
  }
  const sortedFilter = medianFilter.slice(0);
  sortedFilter.sort((vala, valb) => {
    return vala - valb;
  });
  const medianLength = sortedFilter.length;
  return sortedFilter[Math.floor(medianLength / 2)];

  // return latestPitch;
}
