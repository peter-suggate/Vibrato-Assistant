import React, { Component } from 'react';
import BasicRealtimeAudioDisplay from '../AudioAnalysis/BasicRealtimeAudioDisplay';

export default class Home extends Component {
  render() {
    const styles = require('./Home.scss');
    return (
      <div className={styles.home}>
        <div className="container">
          <BasicRealtimeAudioDisplay />
        </div>
      </div>
    );
  }
}
