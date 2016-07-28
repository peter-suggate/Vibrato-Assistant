import React from 'react'
// import classes from './HomeView.scss'
import { containers } from 'modules/real-time-audio'

export const HomeView = () => {
  const { BasicRealtimeAudioDisplay } = containers

  return <div>
    <BasicRealtimeAudioDisplay />
  </div>
}

export default HomeView
