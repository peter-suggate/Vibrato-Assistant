import { our } from './constants'

export function getKey (state) {
  return our(state).key
}

export function getMode (state) {
  return our(state).mode
}

export function getTempo (state) {
  return our(state).tempo
}

export function isEditing (state) {
  return our(state).editing
}
