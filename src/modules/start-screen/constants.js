export const MODE_MAJOR = 'Major'
export const MODE_MINOR = 'Minor'

export const OPTIONS_SET_EDITING = 'OPTIONS_SET_EDITING'
export const OPTIONS_SET_MODE = 'OPTIONS_SET_MODE'
export const OPTIONS_SET_KEY = 'OPTIONS_SET_KEY'
export const OPTIONS_SET_TEMPO = 'OPTIONS_SET_TEMPO'

export function getStateKey () {
  return 'startOptions'
}

export function our (storeState) {
  return storeState[getStateKey()]
}
