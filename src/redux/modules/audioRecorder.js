const TOGGLE_RECORDING_AUDIO = 'Vibrato/audioRecorder/TOGGLE_RECORDING_AUDIO';
const ADD_NOTE = 'Vibrato/audioRecorder/ADD_NOTE';
const ADD_PITCH = 'Vibrato/audioRecorder/ADD_PITCH';
const ADD_PITCH_MPM = 'Vibrato/audioRecorder/ADD_PITCH_MPM';
const BUMP_ANIMATION_COUNTER = 'Vibrato/audioRecorder/BUMP_ANIMATION_COUNTER';
const CLEAR_AUDIO_DATA = 'Vibrato/audioRecorder/CLEAR_AUDIO_DATA';

const initialState = {
  recording: false,
  recordedPitches: [],
  recordedPitchesMPM: [],
  recordedNotes: [],
  animationCounter: 0
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_RECORDING_AUDIO:
      const {recording} = state;
      return {
        ...state,
        recording: !recording
      };
    case ADD_PITCH: {
      let {recordedPitches} = state;
      recordedPitches = recordedPitches.concat(action.pitch);
      return {
        ...state,
        recordedPitches
      };
    }
    case ADD_PITCH_MPM: {
      let {recordedPitchesMPM} = state;
      recordedPitchesMPM = recordedPitchesMPM.concat(action.pitch);
      return {
        ...state,
        recordedPitchesMPM
      };
    }
    case ADD_NOTE: {
      let {recordedNotes} = state;
      recordedNotes = recordedNotes.concat(action.note);
      return {
        ...state,
        recordedNotes
      };
    }
    case CLEAR_AUDIO_DATA: {
      let {recordedNotes, recordedPitches, recordedPitchesMPM, animationCounter} = state;
      recordedNotes = [];
      recordedPitches = [];
      recordedPitchesMPM = [];
      animationCounter = 0;
      return {
        ...state,
        recordedNotes,
        recordedPitches,
        recordedPitchesMPM,
        animationCounter
      };
    }
    case BUMP_ANIMATION_COUNTER:
      const {animationCounter} = state;
      return {
        ...state,
        animationCounter: animationCounter + 1
      };
    default:
      return state;
  }
}

export function toggleAudioRecording() {
  return {
    type: TOGGLE_RECORDING_AUDIO
  };
}

export function addPitch(pitchData) {
  return {
    type: ADD_PITCH,
    pitch: pitchData
  };
}

export function addPitchMPM(pitchData) {
  return {
    type: ADD_PITCH_MPM,
    pitch: pitchData
  };
}

export function addNote(notePitch, startTimeMsec, durationMsec) {
  return {
    type: ADD_NOTE,
    note: {notePitch, startTimeMsec, durationMsec }
  };
}

export function bumpAnimationCounter() {
  return {
    type: BUMP_ANIMATION_COUNTER
  };
}

export function clearAudioData() {
  return {
    type: CLEAR_AUDIO_DATA
  };
}
