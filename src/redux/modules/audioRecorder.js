const TOGGLE_RECORDING_AUDIO = 'Vibrato/audioRecorder/TOGGLE_RECORDING_AUDIO';
const ADD_NOTE = 'Vibrato/audioRecorder/ADD_NOTE';
const ADD_PITCH = 'Vibrato/audioRecorder/ADD_PITCH';
const BUMP_ANIMATION_COUNTER = 'Vibrato/audioRecorder/BUMP_ANIMATION_COUNTER';

const initialState = {
  recording: false,
  recordedPitches: [],
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
    case ADD_PITCH:
      let {recordedPitches} = state;
      recordedPitches = recordedPitches.concat(action.pitch);
      return {
        ...state,
        recordedPitches
      };
    case ADD_NOTE:
      let {recordedNotes} = state;
      recordedNotes = recordedNotes.concat(action.note);
      return {
        ...state,
        recordedNotes
      };
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
