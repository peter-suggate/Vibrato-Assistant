import React, { Component, PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { selectors } from '..'
import classes from './active-screen.scss'

@connect(state => ({
  activeScreenContainerType: selectors.getActiveScreenContainerType(state),
  activeScreenIndex: state['appScreens'].activeScreenIndex
}))
export default class ActiveScreen extends Component {
  static propTypes = {
    activeScreenContainerType: PropTypes.func.isRequired,
    activeScreenIndex: PropTypes.number.isRequired
  }

  componentWillReceiveProps (nextProps) {
    this.transitionToNextScreen = nextProps.activeScreenIndex > this.props.activeScreenIndex
  }

  render () {
    const { activeScreenContainerType, activeScreenIndex } = this.props
    const ActiveScreen = activeScreenContainerType
    const items = []
    items.push(<ActiveScreen key={activeScreenIndex} />)

    const transitionName = this.transitionToNextScreen ? 'transitionNext' : 'transitionPrev'

    return (
      <div className={classes.container}>
        <ReactCSSTransitionGroup
          transitionName={transitionName} transitionEnterTimeout={300} transitionLeaveTimeout={200}
          >
          {items}
        </ReactCSSTransitionGroup>
      </div>
      )
  }
}
