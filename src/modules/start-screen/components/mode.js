import React, { Component, PropTypes } from 'react'
import classes from './edit-options.scss'

class Mode extends Component {
  static propTypes = {
    selectedMode: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onModeChange = this.onModeChange.bind(this)
  }

  onModeChange (e) {
    this.props.onChange({ type: 'mode', value: e.currentTarget.value })
  }

  render () {
    const { selectedMode } = this.props
    const modes = ['Major', 'Minor']

    const modeElems = modes.map((mode, index) => {
      const checked = mode === selectedMode
      return (
        <div className={classes.modeOption + ' radioWrapper'} key={'modeOption' + index}>
          <input type="radio" name={mode} id={mode} value={mode} checked={checked ? 'checked' : ''}
            onChange={this.onModeChange} />
          <div className="check"></div>
          <label htmlFor={mode} className={classes.keyLabel}>{mode}</label>
        </div>
      )
    })

    return (
      <div className={classes.sectionWrapper}>
        <div className={classes.sectionHeader}>Mode</div>
        <div className={classes.modeOptions}>
          {modeElems}
        </div>
      </div>
    )
  }
}

export default Mode
