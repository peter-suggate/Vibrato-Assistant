export const MODE_MAJOR = 'Major'
export const MODE_MINOR = 'Minor'

export const PASSAGE_SCALE = 'Scale'
export const PASSAGE_ARPEGGIO = 'Arpeggio'

export const OPTIONS_SET_EDITING = 'OPTIONS_SET_EDITING'
export const OPTIONS_SET_MODE = 'OPTIONS_SET_MODE'
export const OPTIONS_SET_KEY = 'OPTIONS_SET_KEY'
export const OPTIONS_SET_TEMPO = 'OPTIONS_SET_TEMPO'
export const OPTIONS_SET_OCTAVES = 'OPTIONS_SET_OCTAVES'
export const OPTIONS_SET_PASSAGE_TYPE = 'OPTIONS_SET_PASSAGE_TYPE'

export function getStateKey () {
  return 'startOptions'
}

export function our (storeState) {
  return storeState[getStateKey()]
}
