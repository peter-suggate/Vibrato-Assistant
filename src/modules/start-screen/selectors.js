import { our } from './constants'

export function getKey (state) {
  return our(state).get('key')
}

export function getMode (state) {
  return our(state).get('mode')
}

export function getTempo (state) {
  return our(state).get('tempo')
}

export function getOctaves (state) {
  return our(state).get('octaves')
}

export function getPassageType (state) {
  return our(state).get('passageType')
}

export function isEditing (state) {
  return our(state).get('editing')
}
