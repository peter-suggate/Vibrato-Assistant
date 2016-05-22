import React, {Component, PropTypes} from 'react';

export default class AudioVolume extends Component {
  static propTypes = {
    volume: PropTypes.number
  }

  componentDidMount() {
    const context = this.refs.canvas.getContext('2d');
    this.paint(context);
  }

  componentDidUpdate() {
    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0, 0, 200, 200);
    this.paint(context);
  }

  static attributes = {
    totalTimeDisplaySeconds: 10,
    volumeMax: 150.0,
    volumeMin: 0.0
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return (tmp + toMin) * (toMax - toMin);
  }

  paint(context) {
    context.save();

    const {volume} = this.props;
    const height = this.linearInterpolate(
      volume,
      AudioVolume.attributes.volumeMin, AudioVolume.attributes.volumeMax,
      0, 200
      );
    // context.translate(100, 100);
    // context.rotate(this.props.volume, 100, 100);
    context.fillStyle = '#F00';
    context.fillRect(0, 0, 200, 200 - height);
    context.restore();
  }

  render() {
    // const {volume} = this.props;

    return (<canvas width={200} height={200} ref="canvas" />);
    // return (<div>Mic volume: {volume}</div>);
  }
}

