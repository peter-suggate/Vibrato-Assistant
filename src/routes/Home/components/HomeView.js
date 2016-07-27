import React from 'react'
import DuckImage from '../assets/Duck.jpg'
import classes from './HomeView.scss'
import { containers } from 'modules/real-time-audio'

export const HomeView = () => {
  const { BasicRealtimeAudioDisplay } = containers

  return <div>
    <h4>Welcome!</h4>
    <img
      alt='This is a duck, because Redux!'
      className={classes.duck}
      src={DuckImage} />
    <BasicRealtimeAudioDisplay />
  </div>
}

export default HomeView
