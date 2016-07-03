
export default class Scroller {
  constructor(clientLength, worldLength) {
    this.velocity = 0;
    this.position = 0;
    this.clientLength = clientLength;
    this.worldLength = worldLength;
  }

  mouseDown() {

  }

  mouseUp() {

  }

  mouseMove() {

  }

  update() {
    this._updateVelocity();
    this._updatePosition();
  }

  _updatePosition() {
    this.position += this.velocity;

    if (this.position < 0) {
      this.position = 0;
    } else if (this.position > this._maxPosition()) {
      this.position = this._maxPosition();
    }
  }

  _updateVelocity() {

  }

  _maxPosition() {
    return this.worldLength - this.clientLength;
  }
}
