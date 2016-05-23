import React, {Component} from 'react';
import { AudioVolume, AudioPitch } from 'components';
import {
  microphoneAvailable,
  beginAudioRecording,
  stopAudioRecording,
  getLatestFrequencyData,
  getLatestPitch
} from '../../helpers/AudioCapture/AudioCapture';

export default class BasicRealtimeAudioDisplay extends Component {

  constructor(props) {
    super(props);
    // this.state = { volume: 0 };

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
    const frequencyAmplitudes = getLatestFrequencyData();
    const pitch = getLatestPitch();
    this.setState({ volumes: frequencyAmplitudes, pitch: pitch });
  }

  render() {
    const {volumes, pitch} = this.state;

    return (
      <div className="container">
        <AudioVolume volumes={volumes} />
        <AudioPitch pitch={pitch} />
      </div>
    );
  }
}
