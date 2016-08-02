import React from 'react'
import classes from './edit-options.scss'
import KeySignatureOptions from './key-signature-options'
import ModeOptions from './mode-options'
import TempoOptions from './tempo-options'
import PassageTypeOptions from './passage-type-options'

const renderDoneButton = (onDone) =>
  <div className={classes.expandUp}>
    <div className={classes.bottomRowContent}>
      <button onClick={onDone} className="primary">Done</button>
    </div>
  </div>

export const EditOptions = ({ keySignature, mode, tempo, octaves, passageType, onOptionChange, onDone }) => {
  const keySignatures = <KeySignatureOptions selectedKey={keySignature} onChange={onOptionChange} />
  const modes = <ModeOptions selectedMode={mode} onChange={onOptionChange} />
  const tempoElems = <TempoOptions selectedTempo={tempo} onChange={onOptionChange} />
  const passageTypeElems = <PassageTypeOptions selectedOctaves={octaves} selectedPassageType={passageType}
    onChange={onOptionChange} />

  return (
    <div className={classes.container + ' floating panel'}>
      <div className={classes.content}>
        {passageTypeElems}
        <div className={classes.divider} />
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
