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

export function isEditing (state) {
  return our(state).get('editing')
}
