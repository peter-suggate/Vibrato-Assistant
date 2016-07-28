const TOGGLE_RECORDING_AUDIO = 'Vibrato/audioRecorder/TOGGLE_RECORDING_AUDIO'
const ADD_NOTE = 'Vibrato/audioRecorder/ADD_NOTE'
const ADD_PITCH = 'Vibrato/audioRecorder/ADD_PITCH'
const ADD_PITCH_MPM = 'Vibrato/audioRecorder/ADD_PITCH_MPM'
const BUMP_ANIMATION_COUNTER = 'Vibrato/audioRecorder/BUMP_ANIMATION_COUNTER'
const CLEAR_AUDIO_DATA = 'Vibrato/audioRecorder/CLEAR_AUDIO_DATA'
const ADD_TIME_DATA = 'Vibrato/audioRecorder/ADD_TIME_DATA'

const initialState = {
  recording: false,
  recordedPitches: [],
  recordedPitchesMPM: [],
  recordedTimeData: [],
  recordedNotes: [],
  animationCounter: 0
}

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case TOGGLE_RECORDING_AUDIO:
      const {recording} = state
      return {
        ...state,
        recording: !recording
      }
    case ADD_PITCH: {
      let {recordedPitches} = state
      recordedPitches = recordedPitches.concat(action.pitch)
      return {
        ...state,
        recordedPitches
      }
    }
    case ADD_PITCH_MPM: {
      let {recordedPitchesMPM} = state
      recordedPitchesMPM = recordedPitchesMPM.concat(action.pitch)
      return {
        ...state,
        recordedPitchesMPM
      }
    }
    case ADD_TIME_DATA: {
      let {recordedTimeData} = state
      recordedTimeData = recordedTimeData.concat(...action.timeData)
      const MAX_RECORDED_TIME_DATA = 100000
      if (recordedTimeData.length > MAX_RECORDED_TIME_DATA) {
        recordedTimeData = recordedTimeData.slice(recordedTimeData.length - MAX_RECORDED_TIME_DATA)
      }
      return {
        ...state,
        recordedTimeData
      }
    }
    case ADD_NOTE: {
      let {recordedNotes} = state
      recordedNotes = recordedNotes.concat(action.note)
      return {
        ...state,
        recordedNotes
      }
    }
    case CLEAR_AUDIO_DATA: {
      let {recordedNotes, recordedPitches, recordedPitchesMPM, recordedTimeData, animationCounter} = state
      recordedNotes = []
      recordedPitches = []
      recordedPitchesMPM = []
      recordedTimeData = []
      animationCounter = 0
      return {
        ...state,
        recordedNotes,
        recordedPitches,
        recordedPitchesMPM,
        recordedTimeData,
        animationCounter
      }
    }
    case BUMP_ANIMATION_COUNTER:
      const {animationCounter} = state
      return {
        ...state,
        animationCounter: animationCounter + 1
      }
    default:
      return state
  }
}

export function toggleAudioRecording () {
  return {
    type: TOGGLE_RECORDING_AUDIO
  }
}

export function addPitch (pitchData) {
  return {
    type: ADD_PITCH,
    pitch: pitchData
  }
}

export function addPitchMPM (pitchData) {
  return {
    type: ADD_PITCH_MPM,
    pitch: pitchData
  }
}

export function addNote (notePitch, startTimeMsec, durationMsec) {
  return {
    type: ADD_NOTE,
    note: {notePitch, startTimeMsec, durationMsec }
  }
}

export function addTimeData (timeData) {
  return {
    type: ADD_TIME_DATA,
    timeData
  }
}

export function bumpAnimationCounter () {
  return {
    type: BUMP_ANIMATION_COUNTER
  }
}

export function clearAudioData () {
  return {
    type: CLEAR_AUDIO_DATA
  }
}
