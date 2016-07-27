import React, {Component, PropTypes} from 'react';

export default class FpsReadout extends Component {
  static propTypes = {
    fps: PropTypes.number.isRequired
  }

  render() {
    return (<div>Current fps: {this.props.fps}</div>);
  }
}
