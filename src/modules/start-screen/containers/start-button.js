import React from 'react'
import { connect } from 'react-redux'

// import classes from './HomeView.scss'
import { containers } from 'modules/real-time-audio'

@connect(state => ({
  
}))
export const HomeView = () => {
  const { BasicRealtimeAudioDisplay } = containers

  return <div>
    <BasicRealtimeAudioDisplay />
  </div>
}

export default HomeView
