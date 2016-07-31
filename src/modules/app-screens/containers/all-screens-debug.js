import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectors } from '..'
import classes from './all-screens-debug.scss'

@connect(state => ({
  screenContainerTypes: selectors.getAllScreenContainerTypes(state)
}))
export default class AllScreens extends Component {
  static propTypes = {
    screenContainerTypes: PropTypes.array.isRequired
  }

  render () {
    const { screenContainerTypes } = this.props

    const items = screenContainerTypes.map(
      (Type, index) => <Type key={'activeScreenIndex-' + index} />
      )

    return (
      <div className={classes.container}>
        {items}
      </div>
      )
  }
}
