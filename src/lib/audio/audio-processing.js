// const soundConst = Math.log(2) / 12;

// export const noteIndexConcertA = 69;
export const A4 = 440.0
export const A4_INDEX = 57

export function noteToPitch (note) {
  // return 0.5 * Math.exp(soundConst * note);
  return 440 * Math.pow(2, (note - A4_INDEX) / 12)
}

export function noteIndexForViolinKeyBaseNote (noteName) {
  const LOWEST_VIOLIN_NOTE_INDEX = A4_INDEX - 12 - 2

  switch (noteName) {
    case 'G':
      return LOWEST_VIOLIN_NOTE_INDEX
    case 'G#':
      return LOWEST_VIOLIN_NOTE_INDEX + 1
    case 'A':
      return LOWEST_VIOLIN_NOTE_INDEX + 2
    case 'A#':
      return LOWEST_VIOLIN_NOTE_INDEX + 3
    case 'B':
      return LOWEST_VIOLIN_NOTE_INDEX + 4
    case 'C':
      return LOWEST_VIOLIN_NOTE_INDEX + 5
    case 'C#':
      return LOWEST_VIOLIN_NOTE_INDEX + 6
    case 'D':
      return LOWEST_VIOLIN_NOTE_INDEX + 7
    case 'D#':
      return LOWEST_VIOLIN_NOTE_INDEX + 8
    case 'E':
      return LOWEST_VIOLIN_NOTE_INDEX + 9
    case 'F':
      return LOWEST_VIOLIN_NOTE_INDEX + 10
    case 'F3':
      return LOWEST_VIOLIN_NOTE_INDEX + 11
    default:
      break
  }
}

const MAJOR_KEY_NOTE_SIZES = [0, 2, 2, 1, 2, 2, 2, 1]

export function noteIndexInMajorKeyToSemitoneIndex (noteIndex) {
  let semitones = 0

  semitones += 12 * (Math.floor(noteIndex / 7))
  noteIndex = noteIndex % 7

  for (let idx = 0; idx < noteIndex + 1; idx++) {
    semitones += MAJOR_KEY_NOTE_SIZES[idx]
  }

  return semitones
}

export function noteIndexForViolinMajorKeyNote (keyName, noteIndexInMajorKey) {
  return noteIndexForViolinKeyBaseNote(keyName) + noteIndexInMajorKeyToSemitoneIndex(noteIndexInMajorKey)
}

export function pitchToNote (pitch) {
//  return (Math.log(2 * pitch)) / soundConst;
  return A4_INDEX + 12 * Math.log2(pitch / 440)
}

export const LOG_OF_DIFFERENCE_BETWEEN_ADJACENT_SEMITONES =
   (Math.log2(880) - Math.log2(440)) / 12 // 12 semitones in an oxtave;

export function logOfDifferenceBetweenAdjacentSemitones () {
  return LOG_OF_DIFFERENCE_BETWEEN_ADJACENT_SEMITONES
}

export function round2dp (number) {
  return Math.round(number * 100) / 100
}

export function pitchToNoteNamePlusOffset (input) {
  if (isNaN(input) || (input === 0)) {
    return null
  } else if ((input < 27.5) || (input > 14080)) {
    return null
  }

  const notes = [
    'C/0', 'C#/0', 'D/0', 'D#/0', 'E/0', 'F/0', 'F#/0', 'G/0', 'G#/0', 'A/0', 'A#/0', 'B/0',
    'C/1', 'C#/1', 'D/1', 'D#/1', 'E/1', 'F/1', 'F#/1', 'G/1', 'G#/1', 'A/1', 'A#/1', 'B/1',
    'C/2', 'C#/2', 'D/2', 'D#/2', 'E/2', 'F/2', 'F#/2', 'G/2', 'G#/2', 'A/2', 'A#/2', 'B/2',
    'C/3', 'C#/3', 'D/3', 'D#/3', 'E/3', 'F/3', 'F#/3', 'G/3', 'G#/3', 'A/3', 'A#/3', 'B/3',
    'C/4', 'C#/4', 'D/4', 'D#/4', 'E/4', 'F/4', 'F#/4', 'G/4', 'G#/4', 'A/4', 'A#/4', 'B/4',
    'C/5', 'C#/5', 'D/5', 'D#/5', 'E/5', 'F/5', 'F#/5', 'G/5', 'G#/5', 'A/5', 'A#/5', 'B/5',
    'C/6', 'C#/6', 'D/6', 'D#/6', 'E/6', 'F/6', 'F#/6', 'G/6', 'G#/6', 'A/6', 'A#/6', 'B/6',
    'C/7', 'C#/7', 'D/7', 'D#/7', 'E/7', 'F/7', 'F#/7', 'G/7', 'G#/7', 'A/7', 'A#/7', 'B/7',
    'C/8', 'C#/8', 'D/8', 'D#/8', 'E/8', 'F/8', 'F#/8', 'G/8', 'G#/8', 'A/8', 'A#/8', 'B/8',
    'C/9', 'C#/9', 'D/9', 'D#/9', 'E/9', 'F/9', 'F#/9', 'G/9', 'G#/9', 'A/9', 'A#/9', 'B/9']

  const MINUS = 0
  const PLUS = 1

  let frequency
  const rr = Math.pow(2.0, 1.0 / 12.0)
  const cent = Math.pow(2.0, 1.0 / 1200.0)
  let rIndex = 0
  let centIndex = 0
  let side

  frequency = A4

  if (input >= frequency) {
    while (input >= rr * frequency) {
      frequency = rr * frequency
      rIndex++
    }
    while (input > cent * frequency) {
      frequency = cent * frequency
      centIndex++
    }
    if ((cent * frequency - input) < (input - frequency)) {
      centIndex++
    }
    if (centIndex > 50) {
      rIndex++
      centIndex = 100 - centIndex
      if (centIndex !== 0) {
        side = MINUS
      } else {
        side = PLUS
      }
    } else {
      side = PLUS
    }
  } else {
    while (input <= frequency / rr) {
      frequency = frequency / rr
      rIndex--
    }
    while (input < frequency / cent) {
      frequency = frequency / cent
      centIndex++
    }
    if ((input - frequency / cent) < (frequency - input)) {
      centIndex++
    }
    if (centIndex >= 50) {
      rIndex--
      centIndex = 100 - centIndex
      side = PLUS
    } else {
      if (centIndex !== 0) {
        side = MINUS
      } else {
        side = PLUS
      }
    }
  }

  const result = notes[A4_INDEX + rIndex]
  let offset = 0
  if (side === PLUS) {
    offset = centIndex
  } else {
    offset = -centIndex
  }

  return {
    noteName: result,
    offset: offset
  }
}

export function pitchToNoteName (pitch) {
  const note = pitchToNoteNamePlusOffset(pitch)
  if (note === null) {
    return null
  }

  return note.noteName
}

export function frequncyAmplitudesToVolume (frequencyAmplitudes) {
  if (frequencyAmplitudes.length === 0) {
    return 0
  }

  let totalVolume = 0

  frequencyAmplitudes.forEach(amplitude => {
    // totalVolume += Math.pow(10, (amplitude / 10));
    if (amplitude > 0) {
      // const logAmp = Math.log(amplitude);
      // totalVolume += logAmp;
      totalVolume += amplitude
    }
  })

  return totalVolume / frequencyAmplitudes.length
}

export const MIN_RECOGNISABLE_PITCH = 110
