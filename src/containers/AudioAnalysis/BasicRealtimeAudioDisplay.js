import React, {PropTypes, Component} from 'react';
import { AudioVolume, AudioPitch, MusicNotationPanel } from 'components';
import {
  microphoneAvailable,
  beginAudioRecording,
  stopAudioRecording,
  getLatestFrequencyData,
  getLatestPitch
} from '../../helpers/Audio/AudioCapture';
import NoteRecorder from '../../helpers/Audio/NoteRecorder';
import {connect} from 'react-redux';
import {toggleAudioRecording} from 'redux/modules/toggleAudioRecording';

@connect(
  state => ({recordingAudio: state.audioAnalysis.recordingAudio})
  )
export default class BasicRealtimeAudioDisplay extends Component {
  static propTypes = {
    recordingAudio: PropTypes.bool,
    dispatch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.init();

    this.updateLoop = this.updateLoop.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
  }

  state = {
    volumes: [],
    pitch: 0
  }

  componentDidMount() {
    this.startStopRecording();
  }

  componentDidUpdate() {
    this.startStopRecording();
  }

  componentWillUnmount() {
    this.stopRecording();
  }

  startStopRecording() {
    if (!microphoneAvailable()) {
      return (<div>Noes, we can't' record from your mic!</div>);
    }

    beginAudioRecording(this.moreAudioRecorded.bind(this));

    const {recordingAudio} = this.props;
    const wasAnimating = this.animating;

    if (wasAnimating !== recordingAudio) {
      if (this.props.recordingAudio) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    }
  }

  init() {
    this.noteRecorder = null;
    this.recordedNotePitches = [];
    this.rafID = null;
    this.animating = false;
  }

  startRecording() {
    this.init();

    this.animating = true;

    this.updateLoop();
  }

  stopRecording() {
    this.animating = false;

    stopAudioRecording();
  }

  updateLoop() {
    if (!this.animating) {
      return;
    }

    this.rafID = window.requestAnimationFrame(this.updateLoop);

    this.moreAudioRecorded();
  }

  moreAudioRecorded() {
    const pitch = getLatestPitch();

    if (this.noteRecorder === null) {
      this.noteRecorder = new NoteRecorder(20);
      this.noteRecorder.start();
    }

    const newNoteAdded = this.noteRecorder.addCurrentPitch(pitch);
    if (newNoteAdded) {
      const notePitch = this.noteRecorder.getLatestNotePitch();
      this.recordedNotePitches.push(notePitch);
    }

    const frequencyAmplitudes = getLatestFrequencyData();
    this.setState({ volumes: frequencyAmplitudes, pitch: pitch });
  }

  toggleRecording() {
    // Dispatch an action.
    const {dispatch} = this.props;
    dispatch(toggleAudioRecording());
  }

  render() {
    const {volumes, pitch} = this.state;
    const {recordingAudio} = this.props;
    const className = 'btn btn-default';

    const audioElements = (
      <div>
        <MusicNotationPanel pitches={this.recordedNotePitches} />
        <AudioVolume volumes={volumes} />
        <AudioPitch pitch={pitch} />
      </div>
    );

    return (
      <div className="container">
        <button className={className} onClick={this.toggleRecording}>
          Recording: {recordingAudio}.
        </button>
        {audioElements}
      </div>
    );
  }
}
