import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectors } from '..'

@connect(state => ({
  activeScreenContainerType: selectors.getActiveScreenContainerType(state)
}))
export default class ActiveScreen extends Component {
  static propTypes = {
    activeScreenContainerType: PropTypes.func.isRequired
  }

  render () {
    const { activeScreenContainerType } = this.props
    const ActiveScreen = activeScreenContainerType
    return <div>
      <ActiveScreen />
    </div>
  }
}
