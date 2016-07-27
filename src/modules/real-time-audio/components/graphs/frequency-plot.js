import React, {PropTypes} from 'react'
import PitchPlotBase from './pitch-plot-base'

export default class PitchPlot extends PitchPlotBase {
  static propTypes = {
    frequencyData: PropTypes.array.isRequired
  }

  paint (context) {
    context.save()

    this.renderFrequencies(context)

    context.restore()
  }

  renderFrequencies (context) {
    const width = this.refs.canvas.clientWidth
    const height = this.refs.canvas.clientHeight
    const {frequencyData} = this.props

    context.fillStyle = 'rgba(0, 0, 0, 0)'
    context.fillRect(0, 0, width, height)

    const bufferLength = frequencyData.length
    const barWidth = (width / bufferLength) * 2.5
    let barHeight
    let xPix = 0

    for (let idx = 0; idx < bufferLength; idx++) {
      barHeight = frequencyData[idx]

      context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
      context.fillRect(xPix, height - (barHeight / 2), barWidth, barHeight / 2)

      xPix += barWidth + 1
    }
  }

  render () {
    const styles = require('./Graphs.scss')

    return (
      <div ref="container" className={styles.frequencyPlotContainer}>
        <canvas className={styles.frequencyPlotCanvas} ref="canvas" />
      </div>
      )
  }
}
