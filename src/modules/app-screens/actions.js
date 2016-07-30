import * as constants from './constants'

export function setActiveScreen (index) {
  if (index === null || index === undefined) {
    throw Error('app-screens|setActiveScreen() invalid index specified', index)
  }

  return {
    type: constants.APP_SCREENS_SET_ACTIVE_SCREEN,
    index
  }
}

export function setRecordScaleScreenActive () {
  return setActiveScreen(constants.RECORD_SCALE_SCREEN_INDEX)
}

export function setStartScreenActive () {
  return setActiveScreen(constants.START_SCREEN_INDEX)
}
