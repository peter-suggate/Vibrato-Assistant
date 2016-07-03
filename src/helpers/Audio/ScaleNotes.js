import {
  noteIndexForViolinMajorKeyNote,
  noteToPitch
} from './AudioProcessing';

export function getNotesForKey(keyName, bpm) {
  const notes = [];
  let startTimeMsec = 0;

  for (let note = 0; note < 8; note++) {
    const noteIndex = noteIndexForViolinMajorKeyNote(keyName, note);
    const notePitch = noteToPitch(noteIndex);
    notes.push({notePitch, startTimeMsec});

    startTimeMsec += 1000 * (60 / bpm);
  }

  return notes;
}
