import React, {Component, PropTypes} from 'react';

export default class PitchPlot extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.logPitchMin = Math.log2(PitchPlot.attributes.pitchMin);
    this.logPitchMax = Math.log2(PitchPlot.attributes.pitchMax);
  }

  static attributes = {
    widthInPixels: 800,
    heightInPixels: 400,
    staffLineFrequencies: [329.63, 392.00, 493.88, 587.33, 698.46],
    pitchMin: 110,
    pitchMax: 1760
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return (tmp + toMin) * (toMax - toMin);
  }

  scalePitchToPixel(pitch) {
    const {heightInPixels} = PitchPlot.attributes;
    const {logPitchMin, logPitchMax} = this;
    const logPitch = Math.log2(pitch);

    return this.linearInterpolate(
      logPitch,
      logPitchMin, logPitchMax,
      0, heightInPixels
    );
  }

  flipY(yPixel) {
    const {heightInPixels} = PitchPlot.attributes;
    return heightInPixels - yPixel;
  }

  renderTrace() {
    const {pitches} = this.props;

    const lines = [];

    let index = 0;
    let prevPitchPixel = 0;
    let curX = 0;
    pitches.forEach(pitch => {
      if (pitch > 0) {
        const pitchPixel = this.scalePitchToPixel(pitch);
        const coords = {
          x1: curX,
          y1: this.flipY(prevPitchPixel),
          x2: curX + 1,
          y2: this.flipY(pitchPixel)
        };
        const key = 'pitch_line_' + index;

        lines.push(
          <line {...coords} stroke="blue" strokeWidth="1" key={key} />
        );

        prevPitchPixel = pitchPixel;
      }

      curX++;
      index++;
    });

    return lines;
  }

  renderStaff() {
    const {widthInPixels, staffLineFrequencies} = PitchPlot.attributes;
    const lines = [];
    let index = 0;

    staffLineFrequencies.forEach(pitch => {
      const pitchPixel = this.flipY(this.scalePitchToPixel(pitch));
      const coords = {
        x1: 0,
        y1: pitchPixel,
        x2: widthInPixels,
        y2: pitchPixel
      };
      const key = 'staff_line_' + index++;

      lines.push(
        <line {...coords} stroke="black" strokeWidth="1" key={key} />
      );
    });

    return lines;
  }

  render() {
    const {widthInPixels, heightInPixels} = PitchPlot.attributes;

    const trace = this.renderTrace();
    const staff = this.renderStaff();

    return (
      <div>
        <svg width={widthInPixels} height={heightInPixels}>
          <circle cx={50} cy={50} r={10} fill="red" />
          {staff}
          {trace}
        </svg>
      </div>
      );
    // return (<div>Mic volume: {volume}</div>);
  }
}
