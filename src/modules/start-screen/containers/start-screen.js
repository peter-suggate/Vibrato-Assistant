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
  octaves: selectors.getOctaves(state),
  passageType: selectors.getPassageType(state),
  editing: selectors.isEditing(state)
}))
export default class StartScreen extends Component {
  static propTypes = {
    keySignature: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    tempo: PropTypes.number.isRequired,
    octaves: PropTypes.number.isRequired,
    passageType: PropTypes.string.isRequired,
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
      case 'octaves':
        dispatch(actions.setOctaves(option.value))
        break
      case 'passageType':
        dispatch(actions.setPassageType(option.value))
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
    const { editing, keySignature, mode, tempo, octaves, passageType } = this.props

    let header = null
    if (editing) {
      header = (
        <div className="editOptionsWrapper" key={'editOptions'}>
          <EditOptions
            keySignature={keySignature} mode={mode} tempo={tempo}
            octaves={octaves} passageType={passageType}
            onOptionChange={this.onOptionChange} onDone={this.onEndEdit}
          />
        </div>
      )
    } else {
      header = (
        <div className="optionsHeaderWrapper" key={'optionsHeader'}>
          <OptionsHeader keySignature={keySignature} mode={mode} tempo={tempo}
            passageType={passageType} octaves={octaves}
            onClick={this.onBeginEdit} />
        </div>
      )
    }

    const transitionName = 'transitionExpand'

    return (
      <div className={classes.container} key="startScreenContainer">
        <ReactCSSTransitionGroup
          transitionName={transitionName} transitionEnterTimeout={300} transitionLeaveTimeout={300}
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
