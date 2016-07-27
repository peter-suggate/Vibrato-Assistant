import React, {PropTypes} from 'react'
import PitchPlotBase from './pitch-plot-base'
import {
  MIN_RECOGNISABLE_PITCH,
  LOG_OF_DIFFERENCE_BETWEEN_ADJACENT_SEMITONES
} from 'lib/audio/audio-processing'
import {IN_TUNE_CENTS_TOLERANCE} from 'app-consts'

export default class PitchPlot extends PitchPlotBase {
  static propTypes = {
    notes: PropTypes.array.isRequired,
    pitchScaling: PropTypes.object.isRequired
  }

  calcXOffset () {
    const width = this.refs.canvas.clientWidth
    const {pitches} = this.props
    const numPitches = pitches.length
    if (numPitches === 0) {
      return 0
    }

    const xOffset = Math.max(0, this.scaleTimeToPixelX(pitches[numPitches - 1].timeMsec) - width)
    return xOffset
  }

  paint (context) {
    context.save()
    // context.fillStyle = '#00F';

    this.renderTrace(context)

    context.restore()
  }

  canDrawLine (pitch, prevPitch) {
    if (pitch < MIN_RECOGNISABLE_PITCH) {
      return false
    }

    const pitchDelta = Math.log2(pitch) - Math.log2(prevPitch)
    const isExcessiveLargeJump = Math.abs(pitchDelta) > 18 * LOG_OF_DIFFERENCE_BETWEEN_ADJACENT_SEMITONES
    return !isExcessiveLargeJump
  }

  renderTrace (context) {
    const height = this.refs.canvas.clientHeight
    const {pitches, pitchScaling} = this.props

    const numPitches = pitches.length
    if (numPitches < 2) {
      return
    }

    const xOffset = this.calcXOffset()

    let {pitch, offsetCents, timeMsec} = pitches[numPitches - 1]
    let prevPitch = pitch
    let prevX = xOffset + this.scaleTimeToPixelX(timeMsec)
    let prevY = this.flipY(pitchScaling.scale(pitch, height), height)
    let prevColor = { red: 0, blue: 0, green: 0 }

    context.beginPath()

    for (let idx = numPitches - 2; idx > 0; --idx) {
      const curPitch = pitches[idx]
      pitch = curPitch.pitch
      offsetCents = curPitch.offsetCents
      timeMsec = curPitch.timeMsec

      const curX = this.scaleTimeToPixelX(timeMsec) - xOffset
      const curY = this.flipY(pitchScaling.scale(pitch, height), height)

      const drawLine = this.canDrawLine(pitch, prevPitch)

      if (drawLine) {
        const color = { red: 0.25, green: 0.25, blue: 0.25 }
        if (offsetCents < -IN_TUNE_CENTS_TOLERANCE) {
          color.red = 1.0
        } else if (offsetCents > IN_TUNE_CENTS_TOLERANCE) {
          color.blue = 1.0
        } else {
          color.red = color.green = color.blue = 1.0
        }

        if (color.red !== prevColor.red || color.green !== prevColor.green || color.blue !== prevColor.blue) {
          const colorIntensity = 255// Math.floor((0.2 * 255) + (0.8 * 255 * volume));
          const colorStyle = `rgb(
            ${Math.round(colorIntensity * color.red)},
            ${Math.round(colorIntensity * color.green)},
            ${Math.round(colorIntensity * color.blue)}` + ')'
          context.stroke() // Finish the previous stroke.

          // Change properties.
          context.strokeStyle = colorStyle

          // Start the path in the new color.
          context.beginPath()
          context.moveTo(prevX, prevY)
          context.lineTo(curX, curY)
          prevColor = color
        } else {
//          context.moveTo(prevX, prevY);
          context.lineTo(curX, curY)
        }
      } else {
        context.moveTo(curX, curY)
      }

      prevY = curY
      prevX = curX
      prevPitch = pitch

      if (curX < 0) {
        break // Finished drawing (from right to left).
      }
    }

    context.stroke()
  }

  render () {
    const styles = require('./Graphs.scss')

    return (
      <div ref="container" className={styles.pitchPlotCanvasContainer}>
        <canvas className={styles.pitchPlotCanvas} ref="canvas" />
      </div>
      )
  }
}
