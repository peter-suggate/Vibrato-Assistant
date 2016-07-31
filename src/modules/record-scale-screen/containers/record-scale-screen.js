import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { actions } from 'modules/app-screens'
// import * as components from '../components'
import classes from './record-scale-screen.scss'
import { containers } from 'modules/real-time-audio'

@connect(state => ({
}))
export default class RecordScaleScreen extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onBackClicked = this.onBackClicked.bind(this)
  }

  onBackClicked () {
    this.props.dispatch(actions.setStartScreenActive())
  }

  render () {
    return (
      <div key="recordScaleScreenContainer" className={classes.container}>
        <div className={classes.headerRow + ' floating panel'}>
          <div className={classes.content}>
            <button onClick={this.onBackClicked}>Back</button>
          </div>
        </div>
        <div className={classes.body}>
          <containers.BasicRealtimeAudioDisplay />
        </div>
      </div>
    )
  }
}
