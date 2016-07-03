import React, {Component, PropTypes} from 'react';
import {
  MIN_RECOGNISABLE_PITCH,
pitchToNoteName
} from 'helpers/Audio/AudioProcessing';

const IN_TUNE_CENTS_TOLERANCE = 10;
// const VARIED_LINE_THICKNESS = false;

function getWidth(element) {
  return element.clientWidth;
}

function getHeight(element) {
  return element.clientHeight;
}

export default class PitchPlotSVG extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired,
    notes: PropTypes.array.isRequired,
    pitchScaling: PropTypes.object.isRequired,
    timeToPixelsRatio: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);

    this.onResize = this.onResize.bind(this);
  }

  state = {};

  componentDidMount() {
    if (!this.refs.container) {
      throw new Error('Cannot find container div');
    }

    this._parent = this.refs.container.parentNode;

    this.getWindow().addEventListener('resize', this.onResize, false);

    this.onResize();
  }

  componentWillUnmount() {
    this.getWindow().removeEventListener('resize', this.onResize);
  }

  onResize() {
    if (this.rqf) return;
    // this.rqf = this.getWindow().requestAnimationFrame(() => {
    //   this.rqf = null;
    //   this.updateDimensions();
    // });
    this.rqf = this.getWindow().setTimeout(() => {
      this.rqf = null;
      this.updateDimensions();
    }, 0);
  }

  // If the component is mounted in a different window to the javascript
  // context, as with https://github.com/JakeGinnivan/react-popout
  // then the `window` global will be different from the `window` that
  // contains the component.
  // Depends on `defaultView` which is not supported <IE9
  getWindow() {
    return this.refs.container ? (this.refs.container.ownerDocument.defaultView || window) : window;
  }

  static attributes = {
    staffLineFrequencies: [329.63, 392.00, 493.88, 587.33, 698.46],
    minStaffLineFrequency: 329.63,
    maxStaffLineFrequency: 698.46,
    pitchMin: MIN_RECOGNISABLE_PITCH,
    pitchMax: 3520
  }

  updateDimensions() {
    const container = this._parent;
    const containerWidth = getWidth(container);
    const containerHeight = getHeight(container);

    if (containerWidth !== this.state.containerWidth ||
      containerHeight !== this.state.containerHeight) {
      this.setState({ containerWidth, containerHeight });
    }
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return (tmp + toMin) * (toMax - toMin);
  }

  scaleTimeToPixelX(timeMsec) {
    const {timeToPixelsRatio} = this.props;

    return timeMsec * timeToPixelsRatio;
  }

  flipY(yPixel, height) {
    return height - yPixel;
  }

  calcXOffset() {
    const {containerWidth} = this.state;
    const width = containerWidth;
    const {pitches} = this.props;
    const numPitches = pitches.length;
    if (numPitches === 0) {
      return 0;
    }

    const xOffset = Math.max(0, this.scaleTimeToPixelX(pitches[numPitches - 1].timeMsec) - width);
    return xOffset;
  }

  renderTrace() {
    const {pitches, pitchScaling} = this.props;
    const {containerWidth, containerHeight} = this.state;

    const width = containerWidth;
    const height = containerHeight;
    const lines = [];

    let index = 0;
    const numPitches = pitches.length;
    if (numPitches < 2) {
      return lines;
    }

    const xOffset = this.calcXOffset();

    let {pitch, offsetCents, volume, timeMsec} = pitches[numPitches - 1];
    // let prevX = xOffset + this.scaleTimeToPixelX(timeMsec);
    // let prevY = this.flipY(pitchScaling.scale(pitch, height), height);
    let prevX = null;
    let prevY = null;

    for (let idx = numPitches - 1; idx > 0; --idx) {
      const curPitch = pitches[idx];
      pitch = curPitch.pitch;
      offsetCents = curPitch.offsetCents;
      volume = curPitch.volume;
      timeMsec = curPitch.timeMsec;

      const curX = this.scaleTimeToPixelX(timeMsec) - xOffset;
      if (curX > width && prevX > width) {
        continue;
      }
      if (curX < 0) {
        break;
      }

      const curY = this.flipY(pitchScaling.scale(pitch, height), height);
      if (prevX && prevY && pitch >= MIN_RECOGNISABLE_PITCH && curY <= height && prevY <= height) {
        const coords = {
          x1: prevX,
          y1: prevY,
          x2: curX,
          y2: curY
        };

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

        const key = 'pitch_line_' + index;
        const colorIntensity = Math.floor((0.2 * 255) + (0.8 * 255 * volume));
        const color = `rgb(${Math.floor(colorIntensity * red)}, ${Math.floor(colorIntensity * green)}, ${Math.floor(colorIntensity * blue)}` + `)`;
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
    const {pitchScaling} = this.props;
    const {staffLineFrequencies} = PitchPlotSVG.attributes;
    const width = this.state.containerWidth;
    const height = this.state.containerHeight;
    const lines = [];
    let index = 0;

    staffLineFrequencies.forEach(pitch => {
      const pitchPixel = this.flipY(pitchScaling.scale(pitch, height), height);
      const coords = {
        x1: 0,
        y1: pitchPixel,
        x2: width,
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
    const height = this.state.containerHeight;

    const noteHeads = [];
    const xOffset = this.calcXOffset();
    let index = 0;

    notes.forEach(note => {
      const {startTimeMsec, notePitch} = note;

      const noteName = pitchToNoteName(notePitch);
      const pitchPixel = this.flipY(pitchScaling.scale(notePitch, height), height);
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
    // const {widthInPixels, heightInPixels} = PitchPlotSVG.attributes;

    const trace = this.renderTrace();
    const staff = this.renderStaff();
    const notes = this.renderNotes();

    const styles = require('./Graphs.scss');

    return (
      <div className={styles.pitchPlotSVG} ref="container">
        <svg ref="svg">
          {trace}
          {staff}
          {notes}
        </svg>
      </div>
      );
  }
}
