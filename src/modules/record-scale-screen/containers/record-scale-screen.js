import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { actions } from 'modules/app-screens'
// import * as components from '../components'
import classes from './record-scale-screen.scss'

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
        <div className={classes.headerRow}>
          <button onClick={this.onBackClicked}>Back</button>
        </div>
        <div className={classes.body}>
          Farts
        </div>
      </div>
    )
  }
}
