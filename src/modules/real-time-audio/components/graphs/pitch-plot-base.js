import {Component, PropTypes} from 'react'

function getWidth (element) {
  return element.clientWidth
}

function getHeight (element) {
  return element.clientHeight
}

export default class PitchPlotBase extends Component {
  static propTypes = {
    pitches: PropTypes.array.isRequired,
    timeToPixelsRatio: PropTypes.number.isRequired
  }

  constructor () {
    super()

    this.onResize = this.onResize.bind(this)
  }

  state = {};

  componentDidMount () {
    const context = this.refs.canvas.getContext('2d')
    // this.resizeCanvasToFitContainer();
    this.paint(context)

    this.getWindow().addEventListener('resize', this.onResize, false)

    this.onResize()
  }

  componentDidUpdate () {
    const {canvas} = this.refs
    const context = canvas.getContext('2d')
    // this.resizeCanvasToFitContainer();
    context.clearRect(0, 0, canvas.width, canvas.height)
    this.paint(context)
  }

  componentWillUnmount () {
    this.getWindow().removeEventListener('resize', this.onResize)
  }

  onResize () {
    if (this.rqf) return
    this.rqf = this.getWindow().setTimeout(() => {
      this.rqf = null
      this.updateDimensions()
    }, 0)
  }

  // If the component is mounted in a different window to the javascript
  // context, as with https://github.com/JakeGinnivan/react-popout
  // then the `window` global will be different from the `window` that
  // contains the component.
  // Depends on `defaultView` which is not supported <IE9
  getWindow () {
    return this.refs.container ? (this.refs.container.ownerDocument.defaultView || window) : window
  }

  updateDimensions () {
    const {canvas, container} = this.refs

    const containerWidth = getWidth(container)
    const containerHeight = getHeight(container)

    if (containerWidth !== this.state.containerWidth ||
      containerHeight !== this.state.containerHeight) {
      this.setState({ containerWidth, containerHeight })
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
  }

  resizeCanvasToFitContainer () {
    const {canvas, container} = this.refs
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
  }

  scaleTimeToPixelX (timeMsec) {
    const {timeToPixelsRatio} = this.props

    return timeMsec * timeToPixelsRatio
  }

  flipY (yPixel, height) {
    return height - yPixel
  }

  calcXOffset () {
    const width = this.refs.canvas.clientWidth
    const {pitches} = this.props
    const numPitches = pitches.length
    if (numPitches === 0) {
      return 0
    }

    const xOffset = Math.max(0, this.scaleTimeToPixelX(pitches[numPitches - 1].timeMsec) - width)
    return xOffset
  }
}
