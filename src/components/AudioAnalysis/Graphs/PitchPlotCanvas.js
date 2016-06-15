import React, {PropTypes} from 'react';
import PitchPlotBase from './PitchPlotBase';
import {
  MIN_RECOGNISABLE_PITCH
} from 'helpers/Audio/AudioProcessing';

const IN_TUNE_CENTS_TOLERANCE = 10;
const VARIED_LINE_THICKNESS = true;

export default class PitchPlot extends PitchPlotBase {
  static propTypes = {
    notes: PropTypes.array.isRequired,
    pitchScaling: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
  }

  calcXOffset() {
    const width = this.refs.canvas.clientWidth;
    const {pitches} = this.props;
    const numPitches = pitches.length;
    if (numPitches === 0) {
      return 0;
    }

    const xOffset = Math.max(0, this.scaleTimeToPixelX(pitches[numPitches - 1].timeMsec) - width);
    return xOffset;
  }

  paint(context) {
    context.save();
    context.fillStyle = '#00F';

    // this.props.pitchScaling.updateVerticalScaling(this.props.pitches);

    this.renderTrace(context);

    context.restore();
  }

  renderTrace(context) {
    const height = this.refs.canvas.clientHeight;
    const {pitches, pitchScaling} = this.props;

    let index = 0;
    const numPitches = pitches.length;
    if (numPitches < 2) {
      return;
    }

    const xOffset = this.calcXOffset();

    let {pitch, offsetCents, volume, timeMsec} = pitches[numPitches - 1];
    let prevX = xOffset + this.scaleTimeToPixelX(timeMsec);
    let prevY = this.flipY(pitchScaling.scale(pitch, height), height);

    let numDrawnLines = 0;

    if (!VARIED_LINE_THICKNESS) {
      context.lineWidth = 1.0;
      context.beginPath();
    } else {
      context.lineCap = 'round';
    }

    for (let idx = numPitches - 2; idx > 0; --idx) {
      const curPitch = pitches[idx];
      pitch = curPitch.pitch;
      offsetCents = curPitch.offsetCents;
      volume = curPitch.volume;
      timeMsec = curPitch.timeMsec;

      const curX = this.scaleTimeToPixelX(timeMsec) - xOffset;
      const curY = this.flipY(pitchScaling.scale(pitch, height), height);
      if (pitch >= MIN_RECOGNISABLE_PITCH && curY <= height && prevY <= height) {
        // const offsetCents = pitchToNoteNamePlusOffset(pitch).offset;
        let red = 0.25;
        let green = 0.25;
        let blue = 0.25;
        if (offsetCents < -IN_TUNE_CENTS_TOLERANCE) {
          red = 1.0;
        } else if (offsetCents > IN_TUNE_CENTS_TOLERANCE) {
          blue = 1.0;
        } else {
          red = green = blue = 1.0;
        }

        const colorIntensity = Math.floor((0.2 * 255) + (0.8 * 255 * volume));
        const color = `rgb(${colorIntensity * red}, ${colorIntensity * green}, ${colorIntensity * blue}` + `)`;
        context.strokeStyle = color;

        if (VARIED_LINE_THICKNESS) {
          context.lineWidth = 1.0 + (volume * 5);
          context.beginPath();
          context.moveTo(prevX, prevY);
          context.lineTo(curX, curY);
          context.stroke();
        } else {
          context.moveTo(prevX, prevY);
          context.lineTo(curX, curY);
        }

        index++;
        numDrawnLines++;
      }

      prevY = curY;
      prevX = curX;

      if (curX < 0) {
        break; // Finished drawing (from right to left).
      }
    }

    if (!VARIED_LINE_THICKNESS) {
      context.stroke();
    }
    // console.log(numDrawnLines);
  }

  render() {
    const styles = require('./Graphs.scss');

    return (
      <div ref="container" className={styles.pitchPlotCanvasContainer}>
        <canvas className={styles.pitchPlotCanvas} ref="canvas" />
      </div>
      );
  }
}
