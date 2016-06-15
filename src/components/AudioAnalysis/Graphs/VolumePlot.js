import React from 'react';
import PitchPlotBase from './PitchPlotBase';

export default class VolumePlot extends PitchPlotBase {
  constructor(props) {
    super(props);
  }

  flipY(yPixel, height) {
    return height - yPixel;
  }

  paint(context) {
    context.save();
    context.fillStyle = '#00F';

    // this.props.pitchScaling.updateVerticalScaling(this.props.pitches);

    this.renderTrace(context);

    context.restore();
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

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return toMin + tmp * (toMax - toMin);
  }

  renderTrace(context) {
    const height = this.refs.canvas.clientHeight;
    const {pitches} = this.props;

    // let index = 0;
    const numPitches = pitches.length;

    const xOffset = this.calcXOffset() + 0.5;
    const yOffset = height / 2;

    context.lineWidth = 1.0;
    context.strokeStyle = 'rgb(192, 192, 192)';
    context.beginPath();

    for (let idx = numPitches - 1; idx > 0; --idx) {
      const pitch = pitches[idx];
      const {volume, timeMsec} = pitch;
      const xPos = this.scaleTimeToPixelX(timeMsec) - xOffset;
      const extent = this.linearInterpolate(volume, 0, 1, -yOffset, yOffset);
      const yBottom = yOffset + extent;
      const yTop = yOffset - extent;
      context.moveTo(xPos, yBottom);
      context.lineTo(xPos, yTop);
      // index++;
      if (xPos <= 0) {
        break;
      }
    }

    context.stroke();
  }

  render() {
    const styles = require('./Graphs.scss');

    return (
      <div ref="container" className={styles.volumePlotCanvasContainer}>
        <canvas className={styles.volumePlotCanvas} ref="canvas" />
      </div>
      );
  }
}
