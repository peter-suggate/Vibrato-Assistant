import React, {Component, PropTypes} from 'react';
// import {bindActionCreators} from 'redux';
// import {connect} from 'react-redux';
// import {load} from 'redux/modules/info';
import * as Vex from 'vexflow';

// @connect(
//     state => ({info: state.info.data}),
//     dispatch => bindActionCreators({load}, dispatch))
export default class MusicNotationPanel extends Component {
   static propTypes = {
     info: PropTypes.object
   }
     // ,
  //   load: PropTypes.func.isRequired

  componentDidMount() {
    const containerElement = this.refs.myContainerElement;

    // var canvas = $("div.one div.a canvas")[0];
    // const renderer = new Vex.Flow.Renderer(canvas,
    //  Vex.Flow.Renderer.Backends.CANVAS);
    const renderer = new Vex.Flow.Renderer(containerElement, Vex.Flow.Renderer.Backends.SVG);

    const svgElement = containerElement.firstChild;
    svgElement.setAttribute(`viewBox`, `0 0 600 100`);

    const ctx = renderer.getContext();
    const stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef(`treble`).setContext(ctx).draw();
  }

  render() {
    return (
      <div>
        <div width={700} height={100} ref="myContainerElement"></div>
      </div>);
    // const {info, load} = this.props; // eslint-disable-line no-shadow
    // const styles = require('./InfoBar.scss');
    // return (
    //   <div className={styles.infoBar + ' well'}>
    //     <div className="container">
    //       This is an info bar
    //       {' '}
    //       <strong>{info ? info.message : 'no info!'}</strong>
    //       <span className={styles.time}>{info && new Date(info.time).toString()}</span>
    //       <button className="btn btn-primary" onClick={load}>Reload from server</button>
    //     </div>
    //   </div>
    // );
  }
}
