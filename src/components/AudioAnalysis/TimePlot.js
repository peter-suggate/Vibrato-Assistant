import React, {Component, PropTypes} from 'react';

export default class TimePlot extends Component {
  static propTypes = {
    valueMax: PropTypes.number,
    valueMin: PropTypes.number,
    values: PropTypes.array
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const context = this.refs.canvas.getContext('2d');
    this.paint(context);
  }

  componentDidUpdate() {
    const {widthInPixels, heightInPixels} = TimePlot.attributes;

    const context = this.refs.canvas.getContext('2d');
    context.clearRect(0, 0, widthInPixels, heightInPixels);
    this.paint(context);
  }

  static attributes = {
    widthInPixels: 800,
    heightInPixels: 200
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return (tmp + toMin) * (toMax - toMin);
  }

  drawTrace(context) {
    const {values, valueMin, valueMax} = this.props;
    const {heightInPixels} = TimePlot.attributes;

    context.beginPath();
    context.moveTo(0, values);

    let xPixel = 0;
    values.forEach(function drawLibe(value) {
      const yPixel = this.linearInterpolate(
        value,
        valueMin, valueMax,
        0, heightInPixels
      );

      context.lineTo(xPixel, heightInPixels - yPixel);
      xPixel++;
    }.bind(this));

    context.stroke();
  }

  paint(context) {
    context.save();
    context.fillStyle = '#00F';

    this.drawTrace(context);

    context.restore();
  }

  render() {
    const {widthInPixels, heightInPixels} = TimePlot.attributes;

    return (
      <div>
        <canvas width={widthInPixels} height={heightInPixels} ref="canvas" />
      </div>
      );
    // return (<div>Mic volume: {volume}</div>);
  }
}