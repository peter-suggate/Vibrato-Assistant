import React from 'react'
import classes from './HomeView.scss'
import { containers } from 'modules/app-screens'

export const HomeView = () => {
  const { ActiveScreen } = containers

  return <div className={classes.homeView}>
    <ActiveScreen />
  </div>
}

export default HomeView
