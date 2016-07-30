export function getStateKey () {
  return 'recordScaleScreen'
}

export function our (storeState) {
  return storeState[getStateKey()]
}
