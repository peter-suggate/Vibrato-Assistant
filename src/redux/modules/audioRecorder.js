const TOGGLE_RECORDING_AUDIO = 'Vibrato/audioRecorder/TOGGLE_RECORDING_AUDIO';
const ADD_NOTE = 'Vibrato/audioRecorder/ADD_NOTE';

const initialState = {
  recording: false,
  recordedNotes: []
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_RECORDING_AUDIO:
      const {recording} = state;
      return {
        ...state,
        recording: !recording
      };
    case ADD_NOTE:
      let {recordedNotes} = state;
      recordedNotes = recordedNotes.concat(action.note);
      return {
        ...state,
        recordedNotes
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

export function addNote(note, startTimeMsec, durationMsec) {
  return {
    type: ADD_NOTE,
    note,
    startTimeMsec,
    durationMsec
  };
}
