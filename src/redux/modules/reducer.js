import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';

import audioRec from './audioRecorder';

export default combineReducers({
  reduxAsyncConnect,
  routing: routerReducer,
  audioRecorder: audioRec
});
