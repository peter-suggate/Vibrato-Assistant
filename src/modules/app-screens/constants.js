export const APP_SCREENS_SET_ACTIVE_SCREEN = 'APP_SCREENS_SET_ACTIVE'

export const START_SCREEN_INDEX = 0
export const RECORD_SCALE_SCREEN_INDEX = 1

export function getStateKey () {
  return 'appScreens'
}

export function our (storeState) {
  return storeState[getStateKey()]
}
