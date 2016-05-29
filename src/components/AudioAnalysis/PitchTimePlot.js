import TimePlot from './TimePlot';
import * as Audio from '../../helpers/Audio/AudioProcessing';

export default class PitchTimePlot extends TimePlot {
  constructor(props) {
    super(props);
  }

  topNoteIndex() {
    const {valueMax} = this.props;
    const index = Audio.pitchToNote(valueMax);
    return index;
  }

  topNotePitch() {
    return Audio.noteToPitch(this.topNoteIndex());
  }

  bottomNoteIndex() {
    const {valueMin} = this.props;
    const index = Audio.pitchToNote(valueMin);
    return index;
  }

  bottomNotePitch() {
    return Audio.noteToPitch(this.bottomNoteIndex());
  }

  numberOfLines() {
    return this.topNoteIndex() - this.bottomNoteIndex();
  }

  scaleValueToPixel(pitch) {
    return Math.log2(pitch);
  }

  linearInterpolate(val, fromMin, fromMax, toMin, toMax) {
    const tmp = (val - fromMin) / (fromMax - fromMin);
    return (tmp + toMin) * (toMax - toMin);
  }

  // processedValue(value) {
  //   return Math.log2(value);
  // }

  drawNoteLines(context) {
    const {valueMax} = this.props;
    const {widthInPixels, heightInPixels} = TimePlot.attributes;

    const numLines = this.numberOfLines();

    const topLineY = this.scaleValueToPixel(valueMax);
    const lineSpacing = heightInPixels / (numLines - 1);

    context.beginPath();

    for (let index = 0; index < numLines; ++index) {
      const lineY = topLineY + lineSpacing * index;
      context.moveTo(0, lineY);
      context.lineTo(widthInPixels, lineY);
    }

    context.stroke();
  }

  paint(context) {
    super.paint(context);

    context.save();
    context.fillStyle = '#00F';

    this.drawNoteLines(context);
    this.drawTrace(context);

    context.restore();
  }

}
