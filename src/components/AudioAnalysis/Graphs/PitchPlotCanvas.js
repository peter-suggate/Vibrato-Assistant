import React, {Component, PropTypes} from 'react';
import {
  MIN_RECOGNISABLE_PITCH,
  pitchToNoteNamePlusOffset
} from 'helpers/Audio/AudioProcessing';

const IN_TUNE_CENTS_TOLERANCE = 10;

export default class PitchPlot extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    pitchScaling: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const context = this.refs.canvas.getContext('2d');
    this.paint(context);
  }

  componentDidUpdate() {
    const {widthInPixels, heightInPixels} = PitchPlot.attributes;

    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0, 0, widthInPixels, heightInPixels);
    this.paint(context);
  }

  static attributes = {
    widthInPixels: 800,
    heightInPixels: 400,
    staffLineFrequencies: [329.63, 392.00, 493.88, 587.33, 698.46]
  }

  scaleTimeToPixelX(timeMsec) {
    return timeMsec / 10.0;
  }

  flipY(yPixel) {
    const {heightInPixels} = PitchPlot.attributes;
    return heightInPixels - yPixel;
  }

  calcXOffset() {
    const {widthInPixels} = PitchPlot.attributes;
    const {pitches} = this.props;
    const numPitches = pitches.length;
    if (numPitches === 0) {
      return 0;
    }

    const xOffset = Math.max(0, this.scaleTimeToPixelX(pitches[numPitches - 1].timeMsec) - widthInPixels);
    return xOffset;
  }

  paint(context) {
    context.save();
    context.fillStyle = '#00F';

    this.props.pitchScaling.updateVerticalScaling(this.props.pitches);

    this.renderTrace(context);

    context.restore();
  }

  renderTrace(context) {
    const {pitches, pitchScaling} = this.props;
    const {heightInPixels} = PitchPlot.attributes;

    let index = 0;
    const numPitches = pitches.length;
    if (numPitches < 2) {
      return;
    }

    const xOffset = this.calcXOffset();

    let {pitch, volume, timeMsec} = pitches[numPitches - 1];
    let prevX = xOffset + this.scaleTimeToPixelX(timeMsec);
    let prevY = this.flipY(pitchScaling.scale(pitch, heightInPixels));

    context.lineCap = 'round';
    let numDrawnLines = 0;

    for (let idx = numPitches - 2; idx > 0; --idx) {
      const curPitch = pitches[idx];
      pitch = curPitch.pitch;
      volume = curPitch.volume;
      timeMsec = curPitch.timeMsec;

      const curX = this.scaleTimeToPixelX(timeMsec) - xOffset;
      const curY = this.flipY(pitchScaling.scale(pitch, heightInPixels));
      if (pitch >= MIN_RECOGNISABLE_PITCH && curY <= heightInPixels && prevY <= heightInPixels) {
        const offsetCents = pitchToNoteNamePlusOffset(pitch).offset;
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
        context.lineWidth = 0.5 + (volume * 5);

        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(curX, curY);
        context.stroke();

        index++;
        numDrawnLines++;
      }

      prevY = curY;
      prevX = curX;

      if (curX < 0) {
        break; // Finished drawing (from right to left).
      }
    }

    console.log(numDrawnLines);
  }

  render() {
    const {widthInPixels, heightInPixels} = PitchPlot.attributes;

    const styles = require('./Graphs.scss');

    return (<canvas className={styles.pitchPlotCanvas} width={widthInPixels} height={heightInPixels} ref="canvas" />);
  }
}
