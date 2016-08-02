import * as constants from './constants'

export function setKeySignature (key) {
  if (key === null || key === undefined) {
    throw Error('start-screen|setKey() invalid key specified', key)
  }

  return {
    type: constants.OPTIONS_SET_KEY,
    key
  }
}

export function setMode (mode) {
  if (mode === null || mode === undefined) {
    throw Error('start-screen|setMode() invalid mode specified', mode)
  }

  return {
    type: constants.OPTIONS_SET_MODE,
    mode
  }
}

export function setTempo (tempo) {
  if (tempo === null || tempo === undefined) {
    throw Error('start-screen|setTempo() invalid tempo specified', tempo)
  }

  return {
    type: constants.OPTIONS_SET_TEMPO,
    tempo
  }
}

export function setOctaves (octaves) {
  if (octaves === null || octaves === undefined) {
    throw Error('start-screen|setOctaves() invalid number of octaves specified', octaves)
  }

  return {
    type: constants.OPTIONS_SET_OCTAVES,
    octaves
  }
}

export function setPassageType (passageType) {
  if (passageType === null || passageType === undefined) {
    throw Error('start-screen|setPassageType() invalid number of octaves specified', passageType)
  }

  return {
    type: constants.OPTIONS_SET_PASSAGE_TYPE,
    passageType
  }
}

export function setEditing (editing) {
  return {
    type: constants.OPTIONS_SET_EDITING,
    editing
  }
}
