import React, { Component } from 'react'
import Perf from 'react-addons-perf'
import classes from './react-perf-panel.scss'

class ReactPerfPanel extends Component {
  constructor () {
    super()

    this.onToggleRecording = this.onToggleRecording.bind(this)

    this.state = { recording: false }
  }

  onToggleRecording () {
    const { recording } = this.state

    if (recording) {
      Perf.stop()

      const measurements = Perf.getLastMeasurements()
      Perf.printExclusive(measurements)
      Perf.printInclusive(measurements)
      Perf.printWasted(measurements)
    } else {
      Perf.start()
    }

    this.setState({ recording: !recording })
  }

  render () {
    const { recording } = this.state

    const buttonText = recording ? 'Stop Measuring' : 'Start Measuring'

    return (
      <div className={classes.container}>
        <button onClick={this.onToggleRecording}>{buttonText}</button>
      </div>
    )
  }
}

export default ReactPerfPanel
