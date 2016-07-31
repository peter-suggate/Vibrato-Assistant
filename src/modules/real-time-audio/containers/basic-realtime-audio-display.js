import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import {
  PitchPlotSVG,
  PitchPlotCanvas,
  TimeDataPlot,
  VolumePlot,
  FpsReadout,
  FrequencyPlot
} from '../components'
import {
  toggleAudioRecording,
  addPitch,
  addPitchMPM,
  addTimeData,
  addNote,
  clearAudioData,
  bumpAnimationCounter
} from '../reducers'
import {
  microphoneAvailable,
  beginAudioRecording,
  stopAudioRecording,
  // getLatestFrequencyData,
  // getLatestPitch,
  registerOnPitchDataArrivedCallback,
  registerOnPitchDataMPMArrivedCallback,
  registerOnTimeDataArrivedCallback,
  getLatestFrequencyData
} from 'lib/audio/audio-capture'
import {
  // frequncyAmplitudesToVolume,
  logOfDifferenceBetweenAdjacentSemitones
} from 'lib/audio/audio-processing'
import FixedPeriodNoteRecorder from 'lib/audio/fixed-period-note-recorder'
import VariablePeriodNoteRecorder from 'lib/audio/variable-period-note-recorder'
import {nextFakePitch, nextFakeVolume} from 'lib/audio/test-helpers'
import PitchPlotScaling from 'lib/audio/pitch-plot-scaling'
import {getNotesForKey} from 'lib/audio/scale-notes'
import {
  SHOW_LIVE_TIME_DATA
} from 'app-consts'

const useVariableNoteRecorder = true
const FPS_WINDOW_SIZE = 40
// const RECORD_NOTES = true;

const MAIN_PLOT_SCALING_WINDOW_WIDTH_MS = 2000
const MAIN_PLOT_SCALING_PAD = 5 * logOfDifferenceBetweenAdjacentSemitones()
const MINI_PLOT_SCALING_WINDOW_WIDTH_MS = 1000
const MINI_PLOT_SCALING_PAD = 2 * logOfDifferenceBetweenAdjacentSemitones()

const UPDATE_SCALING = false
const FAKE_DATA = false
const SHOW_COMPARISON_PITCHES = false

@connect(
  state => ({
    recordingAudio: state.audioRecorder.recording,
    recordedPitches: state.audioRecorder.recordedPitches,
    recordedPitchesMPM: state.audioRecorder.recordedPitchesMPM,
    recordedNotes: state.audioRecorder.recordedNotes,
    recordedTimeData: state.audioRecorder.recordedTimeData,
    animationCounter: state.audioRecorder.animationCounter
  })
  )
export default class BasicRealtimeAudioDisplay extends Component {
  static propTypes = {
    recordingAudio: PropTypes.bool,
    recordedNotes: PropTypes.array,
    recordedPitches: PropTypes.array,
    recordedPitchesMPM: PropTypes.array,
    recordedTimeData: PropTypes.array,
    dispatch: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.init()

    this.updateLoop = this.updateLoop.bind(this)
    this.toggleRecordingAction = this.toggleRecordingAction.bind(this)
    this.addPitchAction = this.addPitchAction.bind(this)
    this.addPitchMPMAction = this.addPitchMPMAction.bind(this)
    this.addNoteAction = this.addNoteAction.bind(this)
    this.bumpAnimationCounterAction = this.bumpAnimationCounter.bind(this)
    this.onNewPitchRecorded = this.onNewPitchRecorded.bind(this)
    this.onNewPitchRecordedMPM = this.onNewPitchRecordedMPM.bind(this)
    this.onTimeDataRecorded = this.onTimeDataRecorded.bind(this)

    this.changes = {}
    this.recentFps = []
    this.lastRenderTime = null

    this.mainPlotPitchScaling = new PitchPlotScaling(
      true, 110, 1760, MAIN_PLOT_SCALING_WINDOW_WIDTH_MS, MAIN_PLOT_SCALING_PAD)
    this.miniPlotPitchScaling = new PitchPlotScaling(
      true, 110, 1760, MINI_PLOT_SCALING_WINDOW_WIDTH_MS, MINI_PLOT_SCALING_PAD)

    this.unprocessedStateChanges = {
      pitchActions: [],
      pitchActionsMPM: [],
      timeDataActions: []
    }
  }

  state = {
    volumes: [],
    pitch: 0
  }

  componentDidMount () {
    this.toggleStartStopRecording()
  }

  componentWillReceiveProps (nextProps) {
    this.changes = {}

    if (nextProps.recordingAudio !== this.props.recordingAudio) {
      this.changes.recordingAudio = true
    }
  }

  componentDidUpdate () {
    if (this.changes.recordingAudio) {
      this.toggleStartStopRecording()
    }
    // if (this.animating !== this.props.recordingAudio) {
    // this.startStopRecording();
    // }
  }

  componentWillUnmount () {
    this.stopRecording()
  }

  onNewPitchRecorded (pitchAndOffsetCents, volume) {
    const totalVolume = volume
    const {pitch, offsetCents} = pitchAndOffsetCents
    this.unprocessedStateChanges.pitchActions.push({
      pitch,
      offsetCents,
      volume: totalVolume,
      timeMsec: this.noteRecorder.timeAfterStartMsec()
    })
  }

  onNewPitchRecordedMPM (pitchAndOffsetCents, volume) {
    const totalVolume = volume
    const {pitch, offsetCents} = pitchAndOffsetCents
    this.unprocessedStateChanges.pitchActionsMPM.push({
      pitch,
      offsetCents,
      volume: totalVolume,
      timeMsec: this.noteRecorder.timeAfterStartMsec()
    })
  }

  onTimeDataRecorded (timeData) {
    this.unprocessedStateChanges.timeDataActions.push({
      timeData
    })
  }

  toggleStartStopRecording () {
    const {recordingAudio} = this.props
    // const wasAnimating = this.animating;

    // if (wasAnimating !== recordingAudio) {
    if (recordingAudio) {
      this.startRecording()
    } else {
      this.stopRecording()
    }
    // }
  }

  init () {
    this.noteRecorder = null
    this.rafID = null
    this.animating = false
  }

  startRecording () {
    this.init()

    if (!microphoneAvailable()) {
      return (<div>Noes, we can't' record from your mic!</div>)
    }

    registerOnPitchDataArrivedCallback(this.onNewPitchRecorded)
    registerOnPitchDataMPMArrivedCallback(this.onNewPitchRecordedMPM)
    registerOnTimeDataArrivedCallback(this.onTimeDataRecorded)

    if (!FAKE_DATA) {
      beginAudioRecording()
    }

    if (this.props.recordedPitches.length > 0 || this.props.recordedPitchesMPM.length > 0) {
      this.clearAudioDataAction()
    }

    this.startNoteRecorder()

    this.animating = true

    this.updateLoop()
  }

  stopRecording () {
    this.animating = false

    stopAudioRecording()
  }

  startNoteRecorder () {
    if (useVariableNoteRecorder) {
      this.noteRecorder = new VariablePeriodNoteRecorder(true)
    } else {
      this.noteRecorder = new FixedPeriodNoteRecorder(60)
    }
    this.noteRecorder.start()
  }

  updateLoop () {
    if (!this.animating) {
      return
    }

    if (FAKE_DATA) {
      this.addPitchAction({
        pitch: nextFakePitch(),
        offsetCents: -20 + Math.random() * 40,
        volume: nextFakeVolume(),
        timeMsec: this.noteRecorder.timeAfterStartMsec()
      })
    } else {
      this.unprocessedStateChanges.pitchActions.forEach(pitchData => {
        this.addPitchAction(pitchData)
      })
      this.unprocessedStateChanges.pitchActions = []

      this.unprocessedStateChanges.pitchActionsMPM.forEach(pitchData => {
        this.addPitchMPMAction(pitchData)
      })
      this.unprocessedStateChanges.pitchActionsMPM = []

      this.unprocessedStateChanges.timeDataActions.forEach(timeData => {
        this.addTimeDataAction(timeData)
      })
      this.unprocessedStateChanges.timeDataActions = []
    }

    this.rafID = window.requestAnimationFrame(this.updateLoop)
  }

  addPitchAction (actionData) {
    const {dispatch} = this.props
    dispatch(addPitch(actionData))
  }

  addPitchMPMAction (actionData) {
    const {dispatch} = this.props
    dispatch(addPitchMPM(actionData))
  }

  addTimeDataAction (actionData) {
    const {dispatch} = this.props
    dispatch(addTimeData(actionData.timeData))
  }

  addNoteAction (note, startTime, duration) {
    const {dispatch} = this.props
    dispatch(addNote(note, startTime, duration))
  }

  toggleRecordingAction () {
    const {dispatch} = this.props
    dispatch(toggleAudioRecording())
  }

  clearAudioDataAction () {
    const {dispatch} = this.props
    dispatch(clearAudioData())
  }

  bumpAnimationCounter () {
    const {dispatch} = this.props
    dispatch(bumpAnimationCounter())
  }

  updateFps () {
    if (this.lastRenderTime === null) {
      this.lastRenderTime = Date.now()
      return
    }

    const now = Date.now()
    this.recentFps.push(1000 / (now - this.lastRenderTime))
    this.lastRenderTime = now
    if (this.recentFps.length > FPS_WINDOW_SIZE) {
      this.recentFps.shift()
    }
  }

  currentFps () {
    let accum = 0
    this.recentFps.forEach(fps => {
      accum += fps
    })

    if (accum === 0) {
      return 0
    }

    return accum / this.recentFps.length
  }

  render () {
    const styles = require('./basic-realtime-audio-display.scss')

    const {mainPlotPitchScaling, miniPlotPitchScaling} = this
    const {pitch} = this.state
    const {recordingAudio, recordedPitches, recordedPitchesMPM, recordedNotes, recordedTimeData} = this.props
    const className = 'primary'

    this.updateFps()
    const fps = this.currentFps()
    let totalVolume = 0
    if (recordedPitchesMPM.length > 0) {
      totalVolume = recordedPitchesMPM[recordedPitchesMPM.length - 1].volume
    }

    if (UPDATE_SCALING) {
      mainPlotPitchScaling.updateVerticalScaling(recordedPitchesMPM)
    }

    const scaleNotes = getNotesForKey('C', 60)

    // const showAll = false
    let all = null
    // if (showAll) {
    //   all = (
    //     <div>
    //       <AudioVolume volumes={volumes} />
    //       <AudioPitch pitch={pitch} />
    //       <MusicNotationPanel pitches={recordedNotes} />
    //     </div>
    //   )
    // }

    const showVolume = true
    let volumePlot = null
    if (showVolume) {
      volumePlot = <VolumePlot pitches={recordedPitchesMPM} timeToPixelsRatio={0.1} />
    }

    const showCanvas = true
    let canvasElem = null
    let canvasElemMPM = null
    if (showCanvas) {
      canvasElemMPM = <PitchPlotCanvas
        pitches={recordedPitchesMPM} notes={recordedNotes} pitchScaling={mainPlotPitchScaling}
        timeToPixelsRatio={0.1} />
      if (SHOW_COMPARISON_PITCHES) {
        canvasElem = <PitchPlotCanvas
          pitches={recordedPitches} notes={recordedNotes} pitchScaling={mainPlotPitchScaling}
          timeToPixelsRatio={0.1} />
      }
    }

    const showSVG = true
    let svgElem = null
    if (showSVG) {
      svgElem = <PitchPlotSVG pitches={recordedPitchesMPM} notes={scaleNotes}
        pitchScaling={mainPlotPitchScaling} timeToPixelsRatio={0.1} />
    }

    const showMini = false
    let miniPlot = null
    if (showMini) {
      miniPlot = <PitchPlotCanvas className={styles.pitchPlotMiniParentContainer}
        pitches={recordedPitchesMPM} notes={recordedNotes} pitchScaling={miniPlotPitchScaling}
        timeToPixelsRatio={0.5} />
    }

    const showFrequencies = true
    let frequenciesPlot = null
    if (showFrequencies) {
      const frequencyData = getLatestFrequencyData()
      frequenciesPlot = <FrequencyPlot frequencyData={frequencyData} />
    }

    const showTimeData = SHOW_LIVE_TIME_DATA
    let timeDataPlot = null
    if (showTimeData) {
      timeDataPlot = <TimeDataPlot timeData={recordedTimeData} />
    }

    const audioElements = (
      <div>
        <FpsReadout fps={fps} />
        <div className={styles.pitchPlotParentContainer}>
          {timeDataPlot}
          {canvasElem}
          {canvasElemMPM}
          {svgElem}
          {miniPlot}
        </div>
        <div className={styles.volumePlotParentContainer}>
          {volumePlot}
          {frequenciesPlot}
        </div>
        <h3>Current pitch: {pitch} Hz</h3>
        <h3>Current volume: {totalVolume} dB</h3>
        {all}
      </div>
    )

    return (
      <div className="container">
        <button className={className} onClick={this.toggleRecordingAction}>
          {recordingAudio ? 'Stop Recording' : 'Start Recording'}
        </button>
        {audioElements}
      </div>
    )
  }
}
