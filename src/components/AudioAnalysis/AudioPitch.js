import React, {Component, PropTypes} from 'react';

export default class AudioPitch extends Component {
  static propTypes = {
    pitch: PropTypes.number
  }

  render() {
    return (<div>Recording from your mic. Current pitch (Hz): {this.props.pitch}</div>);
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
