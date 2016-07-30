import * as constants from './constants'

import { StartScreen } from 'modules/start-screen'
import { RecordScaleScreen } from 'modules/record-scale-screen'

if (!RecordScaleScreen) {
  throw Error('app-screens|reducers RecordScaleScreen not defined')
}

const initialState = {
  activeScreenIndex: 0,
  screenContainerTypes: [StartScreen, RecordScaleScreen]
}

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    case constants.APP_SCREENS_SET_ACTIVE_SCREEN:
      const {index} = action
      return {
        ...state,
        activeScreenIndex: index
      }
    default:
      return state
  }
}
