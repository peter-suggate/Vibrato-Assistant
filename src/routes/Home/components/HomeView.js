import React from 'react'
import classes from './HomeView.scss'
import { containers } from 'modules/app-screens'
import ReactPerfPanel from 'modules/debug/react-perf-panel'

export const HomeView = () => {
  const { ActiveScreen } = containers

  return (
    <div className={classes.container}>
      <ReactPerfPanel />
      <ActiveScreen />
    </div>
  )
}

export default HomeView
