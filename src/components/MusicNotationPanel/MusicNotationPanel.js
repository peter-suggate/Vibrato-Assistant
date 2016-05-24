import React, {Component, PropTypes} from 'react';
// import {bindActionCreators} from 'redux';
// import {connect} from 'react-redux';
// import {load} from 'redux/modules/info';
import * as Vex from 'vexflow';
import * as AudioProcessing from '../../helpers/Audio/AudioProcessing';

// @connect(
//     state => ({info: state.info.data}),
//     dispatch => bindActionCreators({load}, dispatch))
export default class MusicNotationPanel extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.renderedPitches = 0;
  }

  componentDidMount() {
    this.renderMusic();
  }

  componentDidUpdate() {
    if (this.props.pitches.length !== this.renderedPitches) {
      this.renderMusic();
    }
  }

  renderMusic() {
    console.log('rendering music, with notes: ' + this.props.pitches.length);
    const containerElement = this.refs.myContainerElement;
    while (containerElement.firstChild) {
      containerElement.removeChild(containerElement.firstChild);
    }

    this.renderer = new Vex.Flow.Renderer(containerElement, Vex.Flow.Renderer.Backends.SVG);

    const svgElement = containerElement.firstChild;
    svgElement.setAttribute(`viewBox`, `0 0 800 200`);

    const ctx = this.renderer.getContext();
    const stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef(`treble`).setContext(ctx).draw();

    const notes = [];
    const {pitches} = this.props;
    pitches.forEach(pitch => {
      const noteName = AudioProcessing.pitchToNoteName(pitch);
      if (noteName && noteName.length > 0) {
        notes.push(new Vex.Flow.StaveNote({ keys: [noteName], duration: `q` }));
      } else {
        notes.push(new Vex.Flow.StaveNote({ keys: [`a/4`], duration: `qr` }));
      }
    });

    if (pitches.length > 0) {
      // Create a voice in 4/4
      const voice = new Vex.Flow.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: Vex.Flow.RESOLUTION
      });

      // Add notes to voice
      voice.addTickables(notes);

      // Format and justify the notes to 500 pixels
      new Vex.Flow.Formatter().
        joinVoices([voice]).format([voice], 500);

      // Render voice
      voice.draw(ctx, stave);
    }

    this.renderedPitches = pitches.length;
  }

  render() {
    return (
      <div>
        <div width={700} height={100} ref="myContainerElement"></div>
      </div>);
  }
}
