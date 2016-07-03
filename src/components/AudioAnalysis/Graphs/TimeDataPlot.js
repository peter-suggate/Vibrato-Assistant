import React, {PropTypes} from 'react';
import PitchPlotBase from './PitchPlotBase';
import PitchPlotScaling from 'helpers/Audio/PitchPlotScaling';

export default class TimeDataPlot extends PitchPlotBase {
  static propTypes = {
    timeData: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.verticalScaling = new PitchPlotScaling(false, -0.3, 0.3);
    this.compression = 1;
    this.compressionInv = 1.0 / this.compression;
  }

  calcXOffset() {
    const width = this.refs.canvas.clientWidth;
    const {timeData} = this.props;
    const numPitches = timeData.length;
    if (numPitches === 0) {
      return 0;
    }

    const xOffset = Math.max(0, (numPitches * this.compressionInv) - width);
    return xOffset;
  }

  paint(context) {
    context.save();
    // context.fillStyle = '#00F';

    this.renderTrace(context);

    context.restore();
  }

  pixelX(index) {
    return index * this.compressionInv;
  }

  dataAtPixel(timeData, pixel) {
    return timeData[pixel * this.compression];
  }

  renderTrace(context) {
    const height = this.refs.canvas.clientHeight;
    const {timeData} = this.props;
    const {verticalScaling} = this;

    const numPitches = timeData.length;
    if (numPitches < this.compression) {
      return;
    }

    const numPixels = Math.floor(numPitches * this.compressionInv);
    const xOffset = this.calcXOffset();

    let pitch = timeData[numPitches - 1];
    let prevX = xOffset + this.pixelX(numPitches - 1);
    let prevY = this.flipY(verticalScaling.scale(pitch, height), height);
    const color = { red: 200, green: 200, blue: 200 };
    const colorStyle = `rgb(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}` + `)`;

    // Change properties.
    context.strokeStyle = colorStyle;

    context.beginPath();

    for (let idx = numPixels - 2; idx > 0; --idx) {
      const pixelX = idx;
      const curX = pixelX - xOffset;

      pitch = this.dataAtPixel(timeData, idx);
      const curY = this.flipY(verticalScaling.scale(pitch, height), height);

      if (idx === numPitches - 2) {
        context.moveTo(prevX, prevY);
      }
      context.lineTo(curX, curY);

      prevY = curY;
      prevX = curX;

      if (curX < 0) {
        break; // Finished drawing (from right to left).
      }
    }

    context.stroke();
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
