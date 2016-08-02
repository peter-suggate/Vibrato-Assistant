import React, { Component, PropTypes } from 'react'
import classes from './edit-options.scss'
import * as constants from '../constants'

class PassageTypeOptions extends Component {
  static propTypes = {
    selectedOctaves: PropTypes.number.isRequired,
    selectedPassageType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor () {
    super()

    this.onOctaveChange = this.onOctaveChange.bind(this)
    this.onTypeChange = this.onTypeChange.bind(this)
  }

  shouldComponentUpdate (nextProps) {
    return this.props.selectedOctaves !== nextProps.selectedOctaves ||
      this.props.selectedPassageType !== nextProps.selectedPassageType
  }

  onOctaveChange (e) {
    this.props.onChange({ type: 'octaves', value: Number(e.currentTarget.value) })
  }

  onTypeChange (e) {
    this.props.onChange({ type: 'passageType', value: e.currentTarget.value })
  }

  render () {
    const { selectedOctaves, selectedPassageType } = this.props
    const octaves = [1, 2, 3]
    const passageTypes = [constants.PASSAGE_SCALE, constants.PASSAGE_ARPEGGIO]

    const passageTypeElems = passageTypes.map((passage, index) => {
      const checked = passage === selectedPassageType
      return (
        <div className={classes.passageTypeOption + ' radioWrapper'} key={'passageOption' + index}>
          <input type="radio" name={passage} id={passage} value={passage} checked={checked ? 'checked' : ''}
            onChange={this.onTypeChange} />
          <div className="check"></div>
          <label htmlFor={passage} className={classes.keyLabel}>{passage}</label>
        </div>
      )
    })

    const octaveElems = octaves.map((octave, index) => {
      const checked = octave === selectedOctaves
      return (
        <div className={classes.octaveOption + ' radioWrapper'} key={'octaveOption' + index}>
          <input type="radio" name={octave} id={octave} value={octave} checked={checked ? 'checked' : ''}
            onChange={this.onOctaveChange} />
          <div className="check"></div>
          <label htmlFor={octave} className={classes.keyLabel}>{octave}</label>
        </div>
      )
    })

    return (
      <div>
        <div className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>Passage type</div>
          <div className={`${classes.passageTypeOptions} flexRowWrapContainer`}>
            {passageTypeElems}
          </div>
        </div>
        <div className={classes.divider} />
        <div className={classes.sectionWrapper}>
          <div className={classes.sectionHeader}>Number of octaves</div>
          <div className={classes.octaveOptions}>
            {octaveElems}
          </div>
        </div>
      </div>
    )
  }
}

export default PassageTypeOptions
