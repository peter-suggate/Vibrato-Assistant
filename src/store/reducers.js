import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as audioRecorder } from 'modules/real-time-audio'
import { reducer as appScreens, getStateKey as getAppScreensKey } from 'modules/app-screens'
import { reducer as startScreen, getStateKey as getStartScreenKey } from 'modules/start-screen'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    // Add sync reducers here
    router,
    audioRecorder,
    [getAppScreensKey()]: appScreens,
    [getStartScreenKey()]: startScreen,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
