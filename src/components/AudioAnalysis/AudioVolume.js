import React, {Component, PropTypes} from 'react';

export default class AudioVolume extends Component {
  static propTypes = {
    volume: PropTypes.number
  }

  render() {
    const {volume} = this.props;

    return (<div>Mic volume: {volume}</div>);
  }
}

