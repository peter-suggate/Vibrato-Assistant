import * as constants from './constants'

const initialState = {
  key: 'C',
  mode: constants.MODE_MAJOR,
  tempo: 60,
  editing: false
}

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case constants.OPTIONS_SET_EDITING: {
      return { ...state, editing: action.editing }
    }
    case constants.OPTIONS_SET_KEY: {
      return { ...state, key: action.key }
    }
    case constants.OPTIONS_SET_MODE: {
      return { ...state, mode: action.mode }
    }
    case constants.OPTIONS_SET_TEMPO: {
      return { ...state, tempo: action.tempo }
    }
    default:
      return state
  }
}
