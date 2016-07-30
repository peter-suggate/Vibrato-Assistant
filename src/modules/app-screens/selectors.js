import { our } from './constants'

export function getScreenContainerType (state, index) {
  return our(state).screenContainerTypes[index]
}

export function getActiveScreenContainerType (state) {
  const activeIndex = our(state).activeScreenIndex
  return getScreenContainerType(state, activeIndex)
}
