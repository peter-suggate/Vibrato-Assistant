import React, {Component} from 'react';
// import {connectMultireducer} from 'multireducer';
// import {increment} from 'redux/modules/counter';
import {microphoneAvailable, beginAudioRecording, stopAudioRecording, getLatestFrequencyData} from '../../helpers/AudioCapture/AudioCapture';
// @connectMultireducer(
//   (key, state) => ({count: state.multireducer[key].count}),
//   {increment}
// )
export default class AudioVolume extends Component {
  // static propTypes = {
    // count: PropTypes.number,
    // increment: PropTypes.func.isRequired,
    // className: PropTypes.string
  // }
  constructor(props) {
    super(props);
    this.state = { volume: 0 };

    this.rafID = null;
    this.animating = true;
    this.updateLoop = this.updateLoop.bind(this);
  }

  componentDidMount() {
    this.state = {volume: 0};

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
    const mag = getLatestFrequencyData();
    this.setState({volume: mag});
  }

  render() {
    return (<div>Recording from your mic. Magnitude: {this.state.volume}</div>);
    // const {count, increment} = this.props; // eslint-disable-line no-shadow
    // let {className} = this.props;
    // className += ' btn btn-default';
    // return (
    //   <button className={className} onClick={increment}>
    //     You have clicked me {count} time{count === 1 ? '' : 's'}.
    //   </button>
    // );
  }
}

