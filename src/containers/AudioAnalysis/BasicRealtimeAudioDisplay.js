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
import {toggleAudioRecording, addNote} from 'redux/modules/audioRecorder';

@connect(
  state => ({
    recordingAudio: state.audioRecorder.recording,
    recordedNotePitches: state.audioRecorder.recordedNotes
  })
  )
export default class BasicRealtimeAudioDisplay extends Component {
  static propTypes = {
    recordingAudio: PropTypes.bool,
    recordedNotePitches: PropTypes.array,
    dispatch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.init();

    this.updateLoop = this.updateLoop.bind(this);
    this.toggleRecordingAction = this.toggleRecordingAction.bind(this);
    this.addNoteAction = this.addNoteAction.bind(this);
  }

  state = {
    volumes: [],
    pitch: 0
  }

  componentDidMount() {
    this.startStopRecording();
  }

  componentDidUpdate() {
    if (this.animating !== this.props.recordingAudio) {
      this.startStopRecording();
    }
  }

  componentWillUnmount() {
    this.stopRecording();
  }

  startStopRecording() {
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
    this.rafID = null;
    this.animating = false;
  }

  startRecording() {
    this.init();

    if (!microphoneAvailable()) {
      return (<div>Noes, we can't' record from your mic!</div>);
    }

    beginAudioRecording(this.moreAudioRecorded.bind(this));

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
      this.noteRecorder = new NoteRecorder(60);
      this.noteRecorder.start();
    }

    const newNoteAdded = this.noteRecorder.addCurrentPitch(pitch);
    if (newNoteAdded) {
      const {notePitch, startTimeMsec, durationMsec} = this.noteRecorder.getLatestNote();
      this.addNoteAction(notePitch, startTimeMsec, durationMsec);
    }

    const frequencyAmplitudes = getLatestFrequencyData();
    this.setState({ volumes: frequencyAmplitudes, pitch: pitch });
  }

  addNoteAction(note, startTime, duration) {
    const {dispatch} = this.props;
    dispatch(addNote(note, startTime, duration));
  }

  toggleRecordingAction() {
    const {dispatch} = this.props;
    dispatch(toggleAudioRecording());
  }

  render() {
    const {volumes, pitch} = this.state;
    const {recordingAudio, recordedNotePitches} = this.props;
    const className = 'btn btn-default';

    const audioElements = (
      <div>
        <MusicNotationPanel pitches={recordedNotePitches} />
        <AudioVolume volumes={volumes} />
        <AudioPitch pitch={pitch} />
      </div>
    );

    return (
      <div className="container">
        <button className={className} onClick={this.toggleRecordingAction}>
          Recording: {recordingAudio ? `true` : `false`}.
        </button>
        {audioElements}
      </div>
    );
  }
}
