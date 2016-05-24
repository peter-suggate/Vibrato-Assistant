const TOGGLE_RECORDING_AUDIO = 'redux-example/recordingAudio/TOGGLE_RECORDING_AUDIO';

const initialState = {
  recordingAudio: false
};

export default function toggleAudioRecordingReducer(state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_RECORDING_AUDIO:
      const {recordingAudio} = state;
      return {
        recordingAudio: !recordingAudio
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
