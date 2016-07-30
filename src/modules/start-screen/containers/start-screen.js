import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { actions } from 'modules/app-screens'
import classes from './start-screen.scss'
import * as components from '../components'

@connect(state => ({
  selectedKey: state.startOptions.selectedKey
}))
export default class StartScreen extends Component {
  static propTypes = {
    selectedKey: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onStartClicked = this.onStartClicked.bind(this)
  }

  onStartClicked () {
    const { dispatch } = this.props

    dispatch(actions.setRecordScaleScreenActive())
  }

  render () {
    const { SelectKey, StartButton } = components
    const { selectedKey } = this.props

    return (
      <div className={classes.container} key="startScreenContainer">
        <div className={classes.optionsRow}>
          <SelectKey key={selectedKey} />
        </div>
        <div className={classes.body}>
          <StartButton onClick={this.onStartClicked} />
        </div>
      </div>
      )
  }
}
