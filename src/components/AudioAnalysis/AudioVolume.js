import React, {Component, PropTypes} from 'react';

export default class AudioVolume extends Component {
  static propTypes = {
    volumes: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.volumeValues = [];
  }

  componentDidMount() {
    const context = this.refs.canvas.getContext('2d');
    this.paint(context);
  }

  componentDidUpdate() {
    const {widthInPixels, heightInPixels} = AudioVolume.attributes;

    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0, 0, widthInPixels, heightInPixels);
    this.paint(context);
  }

  static attributes = {
    totalTimeDisplaySeconds: 10,
    volumeMax: 200.0,
    volumeMin: 0.0,
    widthInPixels: 800,
    heightInPixels: 200
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return toMin + tmp * (toMax - toMin);
  }

  drawAmplitudeBars(context) {
    const {volumes} = this.props;
    const {widthInPixels, heightInPixels, volumeMin, volumeMax} = AudioVolume.attributes;

    const numVolumes = volumes.length;
    const stride = widthInPixels / numVolumes;
    let leftPixel = 0;
    let totalVolume = 0;
    let index = 0;
    volumes.forEach(function drawVolumeBar(volume) {
      const height = this.linearInterpolate(
        volume,
        volumeMin, volumeMax,
        0, heightInPixels
      );
      context.fillRect(leftPixel, heightInPixels - height, stride, heightInPixels);

      totalVolume += volume;
      leftPixel += stride;

      if (index % 2 === 0) {
        context.fillStyle = `#FF0000`;
      } else {
        context.fillStyle = `#0000FF`;
      }
      index++;
    }.bind(this));

    return totalVolume / numVolumes;
  }

  drawVolumeHistoryTrace(context) {
    const {volumeValues} = this;
    const {heightInPixels, volumeMin, volumeMax} = AudioVolume.attributes;

    context.beginPath();
    context.moveTo(0, volumeValues);

    let xPixel = 0;
    volumeValues.forEach(function drawLibe(volumeValue) {
      const yPixel = this.linearInterpolate(
        volumeValue,
        volumeMin, volumeMax,
        0, heightInPixels
      );

      context.lineTo(xPixel, heightInPixels - yPixel);
      xPixel++;
    }.bind(this));

    context.stroke();
  }

  updateVolumeValues(newValue) {
    if (this.volumeValues.length >= AudioVolume.attributes.widthInPixels) {
      this.volumeValues.shift();
    }
    this.volumeValues.push(newValue);
  }

  paint(context) {
    context.save();
    context.fillStyle = '#00F';

    const totalVolume = this.drawAmplitudeBars(context);

    this.updateVolumeValues(totalVolume);

    this.drawVolumeHistoryTrace(context);

    context.restore();
  }

  render() {
    const {widthInPixels, heightInPixels} = AudioVolume.attributes;

    return (<canvas width={widthInPixels} height={heightInPixels} ref="canvas" />);
    // return (<div>Mic volume: {volume}</div>);
  }
}
