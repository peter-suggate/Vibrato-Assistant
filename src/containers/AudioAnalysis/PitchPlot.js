import React, {Component, PropTypes} from 'react';
import {MIN_RECOGNISABLE_PITCH} from 'helpers/Audio/AudioProcessing';

export default class PitchPlot extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired
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
    pitchMin: MIN_RECOGNISABLE_PITCH,
    pitchMax: 3520
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return toMin + tmp * (toMax - toMin);
  }

  scalePitchToPixelY(pitch) {
    const {heightInPixels} = PitchPlot.attributes;
    const {logPitchMin, logPitchMax} = this;
    const logPitch = Math.log2(pitch);

    return this.linearInterpolate(
      logPitch,
      logPitchMin, logPitchMax,
      0, heightInPixels
    );
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

  renderTrace() {
    const {pitches} = this.props;
    const {heightInPixels} = PitchPlot.attributes;

    const lines = [];

    let index = 0;
    const numPitches = pitches.length;
    if (numPitches < 2) {
      return lines;
    }

    const xOffset = this.calcXOffset();

    let {pitch, volume, timeMsec} = pitches[numPitches - 1];
    let prevX = xOffset + this.scaleTimeToPixelX(timeMsec);
    let prevY = this.flipY(this.scalePitchToPixelY(pitch));

    for (let idx = numPitches - 2; idx > 0; --idx) {
      const curPitch = pitches[idx];
      pitch = curPitch.pitch;
      volume = curPitch.volume;
      timeMsec = curPitch.timeMsec;

      const curX = this.scaleTimeToPixelX(timeMsec) - xOffset;
      const curY = this.flipY(this.scalePitchToPixelY(pitch));
      if (pitch >= MIN_RECOGNISABLE_PITCH && curY <= heightInPixels && prevY <= heightInPixels) {
        const coords = {
          x1: prevX,
          y1: prevY,
          x2: curX,
          y2: curY
        };

        const key = 'pitch_line_' + index;
        const intensity = Math.floor(255 * volume);
        const color = `rgb(${intensity}, ${intensity}, ${intensity}` + `)`;
        const strokeWidth = `${0.5 + (volume * 5)}`;
        lines.push(
          <line {...coords} strokeLinecap="round" stroke={color} strokeWidth={strokeWidth} key={key} />
        );

        index++;
      }

      prevY = curY;
      prevX = curX;
    }

    // pitches.forEach(pitchVolAndTime => {
    //   const {pitch, volume, timeMsec} = pitchVolAndTime;

    //   if (pitch > 0) {
    //     const nextX = widthInPixels - this.scaleTimeToPixelX(timeMsec);
    //     const pitchPixel = this.scalePitchToPixelY(pitch);
    //     const coords = {
    //       x1: curX,
    //       y1: this.flipY(prevPitchPixel),
    //       x2: nextX,
    //       y2: this.flipY(pitchPixel)
    //     };
    //     curX = nextX;
    //     const key = 'pitch_line_' + index;
    //     const intensity = Math.floor(255 * volume);
    //     const color = `rgb(${intensity}, ${intensity}, ${intensity}` + `)`;
    //     const strokeWidth = `${1 + (volume * 6)}`;
    //     lines.push(
    //       <line {...coords} strokeLinecap="round" stroke={color} strokeWidth={strokeWidth} key={key} />
    //     );

    //     prevPitchPixel = pitchPixel;
    //   }

      // index++;
    // });

    return lines;
  }

  renderStaff() {
    const {widthInPixels, staffLineFrequencies} = PitchPlot.attributes;
    const lines = [];
    let index = 0;

    staffLineFrequencies.forEach(pitch => {
      const pitchPixel = this.flipY(this.scalePitchToPixelY(pitch));
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

  renderNotes() {
    const {notes} = this.props;

    const noteHeads = [];
    const xOffset = this.calcXOffset();
    let index = 0;

    notes.forEach(note => {
      const {startTimeMsec, notePitch} = note;

      const pitchPixel = this.flipY(this.scalePitchToPixelY(notePitch));
      const coord = {
        cx: this.scaleTimeToPixelX(startTimeMsec) - xOffset,
        cy: pitchPixel
      };
      const key = 'note_head_' + index++;

      noteHeads.push(
        <circle {...coord} r={5} fill="black" key={key} />
      );
    });

    return noteHeads;
  }

  render() {
    const {widthInPixels, heightInPixels} = PitchPlot.attributes;

    const trace = this.renderTrace();
    const staff = this.renderStaff();
    const notes = this.renderNotes();

    return (
      <div>
        <svg width={widthInPixels} height={heightInPixels}>
          {staff}
          {trace}
          {notes}
        </svg>
      </div>
      );
  }
}
