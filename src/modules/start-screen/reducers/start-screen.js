const initialState = {
  selectedKey: 'c4'
}

export default function reducer (state = initialState, action = {}) {
  switch (action.type) {
    default:
      return state
  }
}

export function getStateKey () {
  return 'startOptions'
}

// Actions

// Selectors

export function getSelectedKey (state) {
  return state.startOptions.selectedKey
}
