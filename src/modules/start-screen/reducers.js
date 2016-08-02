import * as constants from './constants'
import Immutable from 'immutable'

const initialState = Immutable.fromJS({
  key: 'C',
  mode: constants.MODE_MAJOR,
  tempo: 60,
  editing: false
})

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case constants.OPTIONS_SET_EDITING: {
      return state.set('editing', action.editing)
    }
    case constants.OPTIONS_SET_KEY: {
      return state.set('key', action.key)
    }
    case constants.OPTIONS_SET_MODE: {
      return state.set('mode', action.mode)
    }
    case constants.OPTIONS_SET_TEMPO: {
      return state.set('tempo', action.tempo)
    }
    default:
      return state
  }
}
