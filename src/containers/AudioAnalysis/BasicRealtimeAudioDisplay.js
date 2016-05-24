import React, {Component} from 'react';
import { AudioVolume, AudioPitch, MusicNotationPanel } from 'components';
import {
  microphoneAvailable,
  beginAudioRecording,
  stopAudioRecording,
  getLatestFrequencyData,
  getLatestPitch
} from '../../helpers/Audio/AudioCapture';
import NoteRecorder from '../../helpers/Audio/NoteRecorder';

export default class BasicRealtimeAudioDisplay extends Component {

  constructor(props) {
    super(props);
    // this.state = { volume: 0 };
    this.noteRecorder = null;
    this.recordedNotePitches = [];

    this.rafID = null;
    this.animating = true;
    this.updateLoop = this.updateLoop.bind(this);
  }

  state = {
    volumes: [],
    pitch: 0
  }

  componentDidMount() {
    // this.state = {volume: 0, pitch: 0};

    if (!microphoneAvailable()) {
      return (<div>Noes, we can't' record from your mic!</div>);
    }

    beginAudioRecording(this.moreAudioRecorded.bind(this));

    this.updateLoop();
  }

  componentWillUnmount() {
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

  // props = {
  //   className: ''
  // }
  moreAudioRecorded() {
    //    console.log('more audio recorded');
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

  render() {
    const {volumes, pitch} = this.state;
    const className = 'btn btn-default';

    return (
      <div className="container">
        <button className={className} onClick={this.toggleRecording}>
          You have clicked me {count} time{count === 1 ? '' : 's'}.
        </button>
        <MusicNotationPanel pitches={this.recordedNotePitches} />
        <AudioVolume volumes={volumes} />
        <AudioPitch pitch={pitch} />
      </div>
    );
  }
}
