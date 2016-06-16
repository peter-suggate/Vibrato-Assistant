import React, {PropTypes, Component} from 'react';
import {
  AudioVolume,
  AudioPitch,
  MusicNotationPanel,
  PitchPlotSVG,
  PitchPlotCanvas,
  VolumePlot,
  FpsReadout
} from 'components';
import {connect} from 'react-redux';
import {
  toggleAudioRecording,
  addPitch,
  addNote,
  clearAudioData,
  bumpAnimationCounter
} from 'redux/modules/audioRecorder';
import {
  microphoneAvailable,
  beginAudioRecording,
  stopAudioRecording,
  // getLatestFrequencyData,
  // getLatestPitch,
  registerOnPitchDataArrivedCallback
} from 'helpers/Audio/AudioCapture';
import {
  // frequncyAmplitudesToVolume,
  logOfDifferenceBetweenAdjacentSemitones
} from 'helpers/Audio/AudioProcessing';
import FixedPeriodNoteRecorder from 'helpers/Audio/FixedPeriodNoteRecorder';
import VariablePeriodNoteRecorder from 'helpers/Audio/VariablePeriodNoteRecorder';
import { nextFakePitch, nextFakeVolume } from 'helpers/Audio/TestHelpers';
import PitchPlotScaling from 'helpers/Audio/PitchPlotScaling';

const useVariableNoteRecorder = true;
const FPS_WINDOW_SIZE = 10;
// const RECORD_NOTES = true;

const MAIN_PLOT_SCALING_WINDOW_WIDTH_MS = 2000;
const MAIN_PLOT_SCALING_PAD = 10 * logOfDifferenceBetweenAdjacentSemitones();
const MINI_PLOT_SCALING_WINDOW_WIDTH_MS = 1000;
const MINI_PLOT_SCALING_PAD = 2 * logOfDifferenceBetweenAdjacentSemitones();

const FAKE_DATA = false;

@connect(
  state => ({
    recordingAudio: state.audioRecorder.recording,
    recordedPitches: state.audioRecorder.recordedPitches,
    recordedNotes: state.audioRecorder.recordedNotes,
    animationCounter: state.audioRecorder.animationCounter
  })
  )
export default class BasicRealtimeAudioDisplay extends Component {
  static propTypes = {
    recordingAudio: PropTypes.bool,
    recordedNotes: PropTypes.array,
    recordedPitches: PropTypes.array,
    dispatch: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.init();

    this.updateLoop = this.updateLoop.bind(this);
    this.toggleRecordingAction = this.toggleRecordingAction.bind(this);
    this.addPitchAction = this.addPitchAction.bind(this);
    this.addNoteAction = this.addNoteAction.bind(this);
    this.bumpAnimationCounterAction = this.bumpAnimationCounter.bind(this);
    this.onNewPitchRecorded = this.onNewPitchRecorded.bind(this);

    this.changes = {};
    this.recentFps = [];
    this.lastRenderTime = null;

    this.mainPlotPitchScaling = new PitchPlotScaling(220, 440, MAIN_PLOT_SCALING_WINDOW_WIDTH_MS, MAIN_PLOT_SCALING_PAD);
    this.miniPlotPitchScaling = new PitchPlotScaling(220, 440, MINI_PLOT_SCALING_WINDOW_WIDTH_MS, MINI_PLOT_SCALING_PAD);

    this.unprocessedStateChanges = {
      pitchActions: []
    };
  }

  state = {
    volumes: [],
    pitch: 0
  }

  componentDidMount() {
    this.toggleStartStopRecording();
  }

  componentWillReceiveProps(nextProps) {
    this.changes = {};

    if (nextProps.recordingAudio !== this.props.recordingAudio) {
      this.changes.recordingAudio = true;
    }
  }

  componentDidUpdate() {
    if (this.changes.recordingAudio) {
      this.toggleStartStopRecording();
    }
    // if (this.animating !== this.props.recordingAudio) {
    // this.startStopRecording();
    // }
  }

  componentWillUnmount() {
    this.stopRecording();
  }

  onNewPitchRecorded(pitchAndOffsetCents, volume) {
    const totalVolume = volume;
    const {pitch, offsetCents} = pitchAndOffsetCents;
    this.unprocessedStateChanges.pitchActions.push({
      pitch,
      offsetCents,
      volume: totalVolume,
      timeMsec: this.noteRecorder.timeAfterStartMsec()
    });
  }

  toggleStartStopRecording() {
    const {recordingAudio} = this.props;
    // const wasAnimating = this.animating;

    // if (wasAnimating !== recordingAudio) {
    if (recordingAudio) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
    // }
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

    registerOnPitchDataArrivedCallback(this.onNewPitchRecorded);

    if (!FAKE_DATA) {
      beginAudioRecording();
    }

    if (this.props.recordedPitches.length > 0) {
      this.clearAudioDataAction();
    }

    this.startNoteRecorder();

    this.animating = true;

    this.updateLoop();
  }

  stopRecording() {
    this.animating = false;

    stopAudioRecording();
  }

  startNoteRecorder() {
    if (useVariableNoteRecorder) {
      this.noteRecorder = new VariablePeriodNoteRecorder(true);
    } else {
      this.noteRecorder = new FixedPeriodNoteRecorder(60);
    }
    this.noteRecorder.start();
  }

  updateLoop() {
    if (!this.animating) {
      return;
    }

    if (FAKE_DATA) {
      this.addPitchAction({
        pitch: nextFakePitch(),
        offsetCents: -20 + Math.random() * 40,
        volume: nextFakeVolume(),
        timeMsec: this.noteRecorder.timeAfterStartMsec()
      });
    } else {
      if (this.unprocessedStateChanges.pitchActions.length === 0) {
        // Force DOM updates as fast as we can go.
        this.bumpAnimationCounterAction();
      } else {
        this.unprocessedStateChanges.pitchActions.forEach(pitchData => {
          this.addPitchAction(pitchData);
        });
        this.unprocessedStateChanges.pitchActions = [];
      }
    }

    this.rafID = window.requestAnimationFrame(this.updateLoop);
  }

  addPitchAction(actionData) {
    const {dispatch} = this.props;
    dispatch(addPitch(actionData));
  }

  addNoteAction(note, startTime, duration) {
    const {dispatch} = this.props;
    dispatch(addNote(note, startTime, duration));
  }

  toggleRecordingAction() {
    const {dispatch} = this.props;
    dispatch(toggleAudioRecording());
  }

  clearAudioDataAction() {
    const {dispatch} = this.props;
    dispatch(clearAudioData());
  }

  bumpAnimationCounter() {
    const {dispatch} = this.props;
    dispatch(bumpAnimationCounter());
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
    const styles = require('./AudioAnalysis.scss');

    const {mainPlotPitchScaling, miniPlotPitchScaling} = this;
    const {volumes, pitch} = this.state;
    const {recordingAudio, recordedPitches, recordedNotes} = this.props;
    const className = 'btn btn-default';

    this.updateFps();
    const fps = this.currentFps();
    let totalVolume = 0;
    if (recordedPitches.length > 0) {
      totalVolume = recordedPitches[recordedPitches.length - 1].volume;
    }

    mainPlotPitchScaling.updateVerticalScaling(recordedPitches);

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

    let volumePlot = null;
    volumePlot = <VolumePlot pitches={recordedPitches} timeToPixelsRatio={0.1} />;

    const showCanvas = true;
    let canvasElem = null;
    if (showCanvas) {
      canvasElem = <PitchPlotCanvas pitches={recordedPitches} notes={recordedNotes} pitchScaling={mainPlotPitchScaling} timeToPixelsRatio={0.1} />;
    }

    const showSVG = false;
    let svgElem = null;
    if (showSVG) {
      svgElem = <PitchPlotSVG pitches={recordedPitches} notes={recordedNotes} pitchScaling={mainPlotPitchScaling} timeToPixelsRatio={0.1} />;
    }

    const showMini = false;
    let miniPlot = null;
    if (showMini) {
      miniPlot = <PitchPlotCanvas className={styles.pitchPlotMiniParentContainer} pitches={recordedPitches} notes={recordedNotes} pitchScaling={miniPlotPitchScaling} timeToPixelsRatio={0.5} />;
    }

    const audioElements = (
      <div>
        <FpsReadout fps={fps} />
        <div className={styles.pitchPlotParentContainer}>
          {canvasElem}
          {svgElem}
          {miniPlot}
        </div>
        <div className={styles.volumePlotParentContainer}>
          {volumePlot}
        </div>
        <h3>Current pitch: {pitch} Hz</h3>
        <h3>Current volume: {totalVolume} dB</h3>
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
