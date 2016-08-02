import React, { Component, PropTypes } from 'react'
import classes from './edit-options.scss'
import KeySignatures from './key-signatures'
import Mode from './mode'
import Tempo from './tempo'

const renderDoneButton = (onDone) =>
  <div className={classes.expandUp}>
    <div className={classes.bottomRowContent}>
      <button onClick={onDone} className="primary">Done</button>
    </div>
  </div>

export const EditOptions = ({ keySignature, mode, tempo, onOptionChange, onDone }) => {
  const keySignatures = <KeySignatures selectedKey={keySignature} onChange={onOptionChange} />
  const modes = <Mode selectedMode={mode} onChange={onOptionChange} />
  const tempoElems = <Tempo selectedTempo={tempo} onChange={onOptionChange} />

  return (
    <div className={classes.container + ' floating panel'}>
      <div className={classes.content}>
        {modes}
        <div className={classes.divider} />
        {keySignatures}
        <div className={classes.divider} />
        {tempoElems}
        {renderDoneButton(onDone)}
      </div>
    </div>
  )
}

export default EditOptions
