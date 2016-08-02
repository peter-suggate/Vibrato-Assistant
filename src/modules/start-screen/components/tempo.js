
function onTempoChange (onOptionChange, e) {
  onOptionChange({ type: 'tempo', value: Number(e.currentTarget.value) })
}

import React, { Component, PropTypes } from 'react'
import classes from './edit-options.scss'

class Tempo extends Component {
  static propTypes = {
    selectedTempo: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onTempoChange = this.onTempoChange.bind(this)
  }

  onTempoChange (e) {
    this.props.onChange({ type: 'tempo', value: Number(e.currentTarget.value) })
  }

  render () {
    const { selectedTempo } = this.props

    const min = 20
    const max = 250

    return (
      <div className={classes.sectionWrapper}>
        <div className={classes.sectionHeader}>Tempo</div>
        <div className={`${classes.sectionContent} ${classes.tempoContent} `}>
          <div className={classes.sliderWrapper}>
            <input className={classes.rowItem} type="range" id="tempoSlider" name="tempoSlider"
              min={min} max={max} value={selectedTempo} onChange={this.onTempoChange} />
            <div className={`${classes.sliderMin} ${classes.sliderLabel}`}>{min} BPM</div>
            <div className={`${classes.sliderMax} ${classes.sliderLabel}`}>{max} BPM</div>
          </div>
          <input className={classes.tempoText} type="text" value={selectedTempo} onChange={this.onTempoChange} />
        </div>
      </div>
    )
  }
}

export default Tempo
