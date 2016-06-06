import React, {Component, PropTypes} from 'react';
import {
  MIN_RECOGNISABLE_PITCH,
pitchToNoteName
} from 'helpers/Audio/AudioProcessing';

export default class PitchPlotSVG extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    pitchScaling: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
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
    return (tmp + toMin) * (toMax - toMin);
  }

  scaleTimeToPixelX(timeMsec) {
    return timeMsec / 10.0;
  }

  flipY(yPixel) {
    const {heightInPixels} = PitchPlotSVG.attributes;
    return heightInPixels - yPixel;
  }

  calcXOffset() {
    const {widthInPixels} = PitchPlotSVG.attributes;
    const {pitches} = this.props;
    const numPitches = pitches.length;
    if (numPitches === 0) {
      return 0;
    }

    const xOffset = Math.max(0, this.scaleTimeToPixelX(pitches[numPitches - 1].timeMsec) - widthInPixels);
    return xOffset;
  }

  // renderTrace() {
  //   const {pitches} = this.props;
  //   const {heightInPixels} = PitchPlotSVG.attributes;

  //   const lines = [];

  //   let index = 0;
  //   const numPitches = pitches.length;
  //   if (numPitches < 2) {
  //     return lines;
  //   }

  //   const xOffset = this.calcXOffset();

  //   let {pitch, volume, timeMsec} = pitches[numPitches - 1];
  //   let prevX = xOffset + this.scaleTimeToPixelX(timeMsec);
  //   let prevY = this.flipY(this.scalePitchToPixelY(pitch));

  //   for (let idx = numPitches - 2; idx > 0; --idx) {
  //     const curPitch = pitches[idx];
  //     pitch = curPitch.pitch;
  //     volume = curPitch.volume;
  //     timeMsec = curPitch.timeMsec;

  //     const curX = this.scaleTimeToPixelX(timeMsec) - xOffset;
  //     const curY = this.flipY(this.scalePitchToPixelY(pitch));
  //     if (pitch >= MIN_RECOGNISABLE_PITCH && curY <= heightInPixels && prevY <= heightInPixels) {
  //       const coords = {
  //         x1: prevX,
  //         y1: prevY,
  //         x2: curX,
  //         y2: curY
  //       };

  //       const key = 'pitch_line_' + index;
  //       const intensity = Math.floor(255 * volume);
  //       const color = `rgb(${intensity}, ${intensity}, ${intensity}` + `)`;
  //       const strokeWidth = `${0.5 + (volume * 5)}`;
  //       lines.push(
  //         <line {...coords} strokeLinecap="round" stroke={color} strokeWidth={strokeWidth} key={key} />
  //       );

  //       index++;
  //     }

  //     prevY = curY;
  //     prevX = curX;
  //   }

  //   // pitches.forEach(pitchVolAndTime => {
  //   //   const {pitch, volume, timeMsec} = pitchVolAndTime;

  //   //   if (pitch > 0) {
  //   //     const nextX = widthInPixels - this.scaleTimeToPixelX(timeMsec);
  //   //     const pitchPixel = this.scalePitchToPixelY(pitch);
  //   //     const coords = {
  //   //       x1: curX,
  //   //       y1: this.flipY(prevPitchPixel),
  //   //       x2: nextX,
  //   //       y2: this.flipY(pitchPixel)
  //   //     };
  //   //     curX = nextX;
  //   //     const key = 'pitch_line_' + index;
  //   //     const intensity = Math.floor(255 * volume);
  //   //     const color = `rgb(${intensity}, ${intensity}, ${intensity}` + `)`;
  //   //     const strokeWidth = `${1 + (volume * 6)}`;
  //   //     lines.push(
  //   //       <line {...coords} strokeLinecap="round" stroke={color} strokeWidth={strokeWidth} key={key} />
  //   //     );

  //   //     prevPitchPixel = pitchPixel;
  //   //   }

  //     // index++;
  //   // });

  //   return lines;
  // }

  renderStaff() {
    const {pitchScaling} = this.props;
    const {widthInPixels, staffLineFrequencies, heightInPixels} = PitchPlotSVG.attributes;
    const lines = [];
    let index = 0;

    staffLineFrequencies.forEach(pitch => {
      const pitchPixel = this.flipY(pitchScaling.scale(pitch, heightInPixels));
      const coords = {
        x1: 0,
        y1: pitchPixel,
        x2: widthInPixels,
        y2: pitchPixel
      };
      const key = 'staff_line_' + index++;

      lines.push(
        <line {...coords} stroke="gray" strokeWidth="1" key={key} />
      );
    });

    return lines;
  }

  renderNotes() {
    const {notes, pitchScaling} = this.props;
    const {heightInPixels} = PitchPlotSVG.attributes;

    const noteHeads = [];
    const xOffset = this.calcXOffset();
    let index = 0;

    notes.forEach(note => {
      const {startTimeMsec, notePitch} = note;

      const noteName = pitchToNoteName(notePitch);
      const pitchPixel = this.flipY(pitchScaling.scale(notePitch, heightInPixels));
      const coord = {
        cx: this.scaleTimeToPixelX(startTimeMsec) - xOffset,
        cy: pitchPixel
      };
      const key = 'note_head_' + index++;

      noteHeads.push(
        <g fill="#ccc" key={key}>
          <text x={coord.cx - 40} y={coord.cy}>{noteName}</text>
          <circle {...coord} r={5} />
        </g>
      );
    });

    return noteHeads;
  }

  render() {
    const {widthInPixels, heightInPixels} = PitchPlotSVG.attributes;

    // const trace = this.renderTrace();
    const staff = this.renderStaff();
    const notes = this.renderNotes();

    const styles = require('./Graphs.scss');

    return (
      <div className={styles.pitchPlotSVG}>
        <svg width={widthInPixels} height={heightInPixels}>
          {staff}
          {notes}
        </svg>
      </div>
      );
  }
}
