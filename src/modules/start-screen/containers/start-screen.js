import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { actions as appScreenActions } from 'modules/app-screens'
import { selectors } from 'modules/start-screen'
import classes from './start-screen.scss'
import * as components from '../components'
import * as actions from '../actions'

@connect(state => ({
  keySignature: selectors.getKey(state),
  mode: selectors.getMode(state),
  tempo: selectors.getTempo(state),
  editing: selectors.isEditing(state)
}))
export default class StartScreen extends Component {
  static propTypes = {
    keySignature: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    tempo: PropTypes.number.isRequired,
    editing: PropTypes.bool,
    dispatch: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onStartClicked = this.onStartClicked.bind(this)
    this.onOptionChange = this.onOptionChange.bind(this)
    this.onBeginEdit = this.onBeginEdit.bind(this)
    this.onEndEdit = this.onEndEdit.bind(this)
  }

  onStartClicked () {
    const { dispatch } = this.props

    dispatch(appScreenActions.setRecordScaleScreenActive())
  }

  onOptionChange (option) {
    const { dispatch } = this.props

    switch (option.type) {
      case 'keySignature':
        dispatch(actions.setKeySignature(option.value))
        break
      case 'mode':
        dispatch(actions.setMode(option.value))
        break
      case 'tempo':
        dispatch(actions.setTempo(option.value))
        break
      default:
        throw Error('start-screen|onOptionChange: unhandled option', option.type)
    }
  }

  onBeginEdit () {
    const { dispatch } = this.props
    dispatch(actions.setEditing(true))
  }

  onEndEdit () {
    const { dispatch } = this.props
    dispatch(actions.setEditing(false))
  }

  render () {
    const { OptionsHeader, EditOptions, StartButton } = components
    const { editing, keySignature, mode, tempo } = this.props

    let header = null
    if (editing) {
      header = (
        <EditOptions key={'editOptions'}
          keySignature={keySignature} mode={mode} tempo={tempo}
          onOptionChange={this.onOptionChange} onDone={this.onEndEdit}
        />
      )
    } else {
      header = (
        <OptionsHeader keySignature={keySignature} mode={mode} tempo={tempo}
          onClick={this.onBeginEdit} key={'optionsHeader'} />
      )
    }

    const transitionName = 'transitionExpand'

    return (
      <div className={classes.container} key="startScreenContainer">
        <ReactCSSTransitionGroup
          transitionName={transitionName} transitionEnterTimeout={200} transitionLeaveTimeout={100}
          >
          {header}
        </ReactCSSTransitionGroup>
        <div className={classes.body}>
          <StartButton onClick={this.onStartClicked} />
        </div>
      </div>
      )
  }
}
