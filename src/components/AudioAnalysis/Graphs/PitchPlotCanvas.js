import React, {Component, PropTypes} from 'react';
import {MIN_RECOGNISABLE_PITCH} from 'helpers/Audio/AudioProcessing';

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

    for (let idx = numPitches - 2; idx > 0; --idx) {
      const curPitch = pitches[idx];
      pitch = curPitch.pitch;
      volume = curPitch.volume;
      timeMsec = curPitch.timeMsec;

      const curX = this.scaleTimeToPixelX(timeMsec) - xOffset;
      const curY = this.flipY(pitchScaling.scale(pitch, heightInPixels));
      if (pitch >= MIN_RECOGNISABLE_PITCH && curY <= heightInPixels && prevY <= heightInPixels) {
        const colorIntensity = Math.floor((0.2 * 255) + (0.8 * 255 * volume));
        const color = `rgb(${colorIntensity}, ${colorIntensity}, ${colorIntensity}` + `)`;
        context.strokeStyle = color;
        context.lineWidth = 0.5 + (volume * 5);

        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(curX, curY);
        context.stroke();

        index++;
      }

      prevY = curY;
      prevX = curX;
    }
  }

  render() {
    const {widthInPixels, heightInPixels} = PitchPlot.attributes;

    const styles = require('./Graphs.scss');

    return (<canvas className={styles.pitchPlotCanvas} width={widthInPixels} height={heightInPixels} ref="canvas" />);
  }
}
