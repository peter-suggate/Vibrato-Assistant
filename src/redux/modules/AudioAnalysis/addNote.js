const ADD_NOTE = 'redux-example/audioAnalysis/ADD_NOTE';

const initialState = {
  notes: []
};

export default function addNoteReducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_NOTE:
      let {notes} = state;
      notes = notes.concat(action.note);
      return {
        notes
      };
    default:
      return state;
  }
}

export function addNote(note) {
  return {
    type: ADD_NOTE,
    note
  };
}
