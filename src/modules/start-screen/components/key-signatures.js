import React, { Component, PropTypes } from 'react'
import classes from './edit-options.scss'

class KeySignatures extends Component {
  static propTypes = {
    selectedKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onKeyChange = this.onKeyChange.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return this.props.selectedKey !== nextProps.selectedKey
  }

  onKeyChange (e) {
    this.props.onChange({ type: 'keySignature', value: e.currentTarget.value })
  }

  render () {
    const { selectedKey } = this.props

    const keys = ['A', 'Bb', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab']

    const keyElems = keys.map((key, index) => {
      const checked = key === selectedKey
      return (
        <div className={classes.keyOption + ' radioWrapper'} key={'keyOption' + index}>
          <input type="radio" name={key} id={key} value={key} checked={checked ? 'checked' : ''}
            onChange={this.onKeyChange} />
          <div className="check"></div>
          <label htmlFor={key} className={classes.keyLabel}>{key}</label>
        </div>
      )
    })

    return (
      <div className={classes.sectionWrapper}>
        <div className={classes.sectionHeader}>Key signature</div>
        <div className={classes.keyOptions}>
          {keyElems}
        </div>
      </div>
    )
  }
}

export default KeySignatures
