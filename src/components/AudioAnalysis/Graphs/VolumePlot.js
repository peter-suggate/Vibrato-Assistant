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
    const {pitches} = this.props;

    const numPitches = pitches.length;
    if (numPitches < 1) {
      return;
    }

    const height = this.refs.canvas.clientHeight;
    // const width = this.refs.canvas.clientWidth;

    const xOffset = this.calcXOffset() + 0.5;
    // const yOffset = height / 2;

    context.lineWidth = 1.0;
    context.strokeStyle = 'rgb(192, 192, 192)';
    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    context.beginPath();

    const pitch0 = pitches[numPitches - 1];
    let xPos = this.scaleTimeToPixelX(pitch0.timeMsec) - xOffset;
    context.moveTo(xPos, height);

    for (let idx = numPitches - 1; idx > 0; --idx) {
      const pitch = pitches[idx];
      const {volume, timeMsec} = pitch;
      xPos = this.scaleTimeToPixelX(timeMsec) - xOffset;
      const extent = this.linearInterpolate(volume, 0, 1, 0, height);
      const yTop = height - extent;

      context.lineTo(xPos, yTop);
      if (xPos <= 0) {
        break;
      }
    }

    context.lineTo(xPos, height);

    context.fill();
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
