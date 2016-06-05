import React, {PropTypes, Component} from 'react';
import { AudioVolume, AudioPitch, MusicNotationPanel, PitchPlot, FpsReadout } from 'components';
import {connect} from 'react-redux';
import {toggleAudioRecording, addNote} from 'redux/modules/audioRecorder';
import {
  microphoneAvailable,
  beginAudioRecording,
  stopAudioRecording,
  getLatestFrequencyData,
  getLatestPitch
} from '../../helpers/Audio/AudioCapture';
import { frequncyAmplitudesToVolume } from '../../helpers/Audio/AudioProcessing';
import FixedPeriodNoteRecorder from '../../helpers/Audio/FixedPeriodNoteRecorder';
import VariablePeriodNoteRecorder from '../../helpers/Audio/VariablePeriodNoteRecorder';
import { nextFakePitch, nextFakeVolume } from '../../helpers/Audio/TestHelpers';

const useVariableNoteRecorder = true;
const FPS_WINDOW_SIZE = 10;
const RECORD_NOTES = false;

@connect(
  state => ({
    recordingAudio: state.audioRecorder.recording,
    recordedNotes: state.audioRecorder.recordedNotes
  })
  )
export default class BasicRealtimeAudioDisplay extends Component {
  static propTypes = {
    recordingAudio: PropTypes.bool,
    recordedNotes: PropTypes.array,
    dispatch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.init();

    this.updateLoop = this.updateLoop.bind(this);
    this.toggleRecordingAction = this.toggleRecordingAction.bind(this);
    this.addNoteAction = this.addNoteAction.bind(this);
    this.recentFps = [];
    this.lastRenderTime = null;
  }

  state = {
    volumes: [],
    pitch: 0,
    pitches: []
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
    let pitch = getLatestPitch();
    const {pitches} = this.state;

    // if (pitches.length >= 800) {
    //   pitches = [];
    // }

    const test = false;
    if (test) {
      pitch = nextFakePitch();
    }

    if (pitch === null || !(pitch >= 0)) {
      pitch = 0;
    }

    if (this.noteRecorder === null) {
      if (useVariableNoteRecorder) {
        this.noteRecorder = new VariablePeriodNoteRecorder(true);
      } else {
        this.noteRecorder = new FixedPeriodNoteRecorder(60);
      }
      this.noteRecorder.start();
    }

    const frequencyAmplitudes = getLatestFrequencyData();
    let totalVolume = 0;
    if (test) {
      totalVolume = nextFakeVolume();
    } else {
      totalVolume = frequncyAmplitudesToVolume(frequencyAmplitudes);
      totalVolume /= 80;
    }

    const pitchVolAndTime = {pitch, volume: totalVolume, timeMsec: this.noteRecorder.timeAfterStartMsec()};
    pitches.push(pitchVolAndTime);

    if (RECORD_NOTES) {
      if (this.noteRecorder) {
        const newNoteAdded = this.noteRecorder.addCurrentPitch(pitch);
        if (newNoteAdded) {
          const {notePitch, startTimeMsec, durationMsec} = this.noteRecorder.getLatestNote();
          this.addNoteAction(notePitch, startTimeMsec, durationMsec);
        }
      }
    }

    this.setState({ volumes: frequencyAmplitudes, pitch, pitches });
  }

  addNoteAction(note, startTime, duration) {
    const {dispatch} = this.props;
    dispatch(addNote(note, startTime, duration));
  }

  toggleRecordingAction() {
    const {dispatch} = this.props;
    dispatch(toggleAudioRecording());
  }

  updateFps() {
    if (this.lastRenderTime === null) {
      this.lastRenderTime = Date.now();
      return;
    }

    const now = Date.now();
    this.recentFps.push(1000 / (now - this.lastRenderTime));
    this.lastRenderTime = now;
    if (this.recentFps.length > FPS_WINDOW_SIZE) {
      this.recentFps.shift();
    }
  }

  currentFps() {
    let accum = 0;
    this.recentFps.forEach(fps => {
      accum += fps;
    });

    if (accum === 0) {
      return 0;
    }

    return accum / this.recentFps.length;
  }

  render() {
    const {volumes, pitch, pitches} = this.state;
    const {recordingAudio, recordedNotes} = this.props;
    const className = 'btn btn-default';

    this.updateFps();
    const fps = this.currentFps();
    // const pitchMax = 4020;
    // const pitchMin = 55;
    // const pitchMax = Math.log2(4020);
    // const pitchMin = Math.log2(55);
    // const pitchMax = Math.log2(500);
    // const pitchMin = Math.log2(400);
    const maxVolume = 50;
    const totalVolume = frequncyAmplitudesToVolume(volumes) / maxVolume;

        // <PitchTimePlot values={pitches} valueMax={pitchMax} valueMin={pitchMin} />
    const showAll = false;
    let all = null;
    if (showAll) {
      all = (
        <div>
          <AudioVolume volumes={volumes} />
          <AudioPitch pitch={pitch} />
          <MusicNotationPanel pitches={recordedNotes} />
        </div>
      );
    }
    const audioElements = (
      <div>
        <FpsReadout fps={fps} />
        <h3>Current pitch: {pitch} Hz</h3>
        <h3>Current volume: {totalVolume} dB</h3>
        <PitchPlot pitches={pitches} notes={recordedNotes} />
        {all}
      </div>
    );

    return (
      <div className="container">
        <button className={className} onClick={this.toggleRecordingAction}>
          {recordingAudio ? `Stop Recording` : `Start Recording`}
        </button>
        {audioElements}
      </div>
    );
  }
}
