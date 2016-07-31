import React, { PropTypes } from 'react'
import classes from './options-header.scss'

// <div>Icons made by <a href="http://www.flaticon.com/authors/lucy-g" title="Lucy G">Lucy G</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

const renderOption = (label, val) =>
  <div className={classes.option}>
    <div className={classes.label}>{label}</div>
    <div className={classes.value}>{val}</div>
  </div>

export const OptionsHeader = ({ keySignature, mode, tempo, onClick }) => {
  return (
    <div className={classes.container + ' floating panel'} onClick={onClick}>
      <div className={classes.content}>
        {renderOption('Key', `${keySignature} ${mode}`)}
        {renderOption('Tempo', tempo)}
        <div className={classes.expandDown} />
      </div>
    </div>
  )
}

export default OptionsHeader
