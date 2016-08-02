import React, { PropTypes } from 'react'
import classes from './options-header.scss'

const renderOption = (label, val) =>
  <div className={classes.option}>
    <div className={classes.label}>{label}</div>
    <div className={classes.value}>{val}</div>
  </div>

const renderTempoOption = (label, val) =>
  <div className={classes.option}>
    <div className={classes.label}>{label}</div>
    <div className={classes.crotchet} />
    <div className={classes.value}>{`= ${val}`}</div>
  </div>

export const OptionsHeader = ({ keySignature, mode, tempo, passageType, octaves, onClick }) => {
  return (
    <div className={classes.container + ' floating panel'} onClick={onClick}>
      <div className={classes.content}>
        <div className={`${classes.optionsWrapper} flexRowWrapContainer`}>
          {renderOption('Type', passageType)}
          {renderOption('Octaves', octaves)}
          {renderOption('Key', `${keySignature} ${mode}`)}
          {renderTempoOption('Tempo', tempo)}
        </div>
        <div className={classes.expandDown} />
      </div>
    </div>
  )
}

export default OptionsHeader
