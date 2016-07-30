import React from 'react'
import classes from './start-button.scss'

export const StartButton = ({ onClick }) => {
  return <div>
    <button className={classes.button + ' large'} onClick={onClick}>Start</button>
  </div>
}

export default StartButton
