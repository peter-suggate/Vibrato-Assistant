import {
  noteIndexForViolinMajorKeyNote,
  noteToPitch
} from './audio-processing'

export function getNotesForKey (keyName, octaves, bpm) {
  const notes = []
  let startTimeMsec = 0

  const numNotes = (7 * octaves) + 1

  for (let note = 0; note < numNotes; note++) {
    const noteIndex = noteIndexForViolinMajorKeyNote(keyName, note)
    const notePitch = noteToPitch(noteIndex)
    notes.push({notePitch, startTimeMsec})

    startTimeMsec += 1000 * (60 / bpm)
  }

  for (let note = numNotes - 1; note >= 0; note--) {
    const noteIndex = noteIndexForViolinMajorKeyNote(keyName, note)
    const notePitch = noteToPitch(noteIndex)
    notes.push({notePitch, startTimeMsec})

    startTimeMsec += 1000 * (60 / bpm)
  }

  return notes
}
