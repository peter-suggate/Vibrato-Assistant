import React, { PropTypes } from 'react'
import classes from './edit-options.scss'

function onKeyChange (onOptionChange, e) {
  onOptionChange({ type: 'keySignature', value: e.currentTarget.value })
}

const renderKeySignatures = (selectedKey, selectedMode, onChange) => {
  const keys = ['A', 'Bb', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab']

  const keyElems = keys.map((key, index) => {
    const checked = key === selectedKey
    return (
      <div className={classes.keyOption + ' radioWrapper'} key={'keyOption' + index}>
        <input type="radio" name={key} id={key} value={key} checked={checked ? 'checked' : ''}
          onChange={onChange} />
        <div className="check"></div>
        <label htmlFor={key} className={classes.keyLabel}>{key + ' ' + selectedMode}</label>
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

function onModeChange (onOptionChange, e) {
  onOptionChange({ type: 'mode', value: e.currentTarget.value })
}

const renderMode = (selectedMode, onChange) => {
  const modes = ['Major', 'Minor']

  const modeElems = modes.map((mode, index) => {
    const checked = mode === selectedMode
    return (
      <div className={classes.keyOption + ' radioWrapper'} key={'modeOption' + index}>
        <input type="radio" name={mode} id={mode} value={mode} checked={checked ? 'checked' : ''}
          onChange={onChange} />
        <div className="check"></div>
        <label htmlFor={mode} className={classes.keyLabel}>{mode}</label>
      </div>
    )
  })

  return (
    <div className={classes.sectionWrapper}>
      <div className={classes.sectionHeader}>Mode</div>
      <div className={classes.keyOptions}>
        {modeElems}
      </div>
    </div>
  )
}

function onTempoChange (onOptionChange, e) {
  onOptionChange({ type: 'tempo', value: Number(e.currentTarget.value) })
}

const renderTempo = (selectedTempo, onChange) => {
  const min = 20
  const max = 250

  return (
    <div className={classes.sectionWrapper}>
      <div className={classes.sectionHeader}>Tempo</div>
      <div className={`${classes.sectionContent} ${classes.tempoContent} `}>
        <div className={classes.sliderWrapper}>
          <input className={classes.rowItem} type="range" id="tempoSlider" name="tempoSlider" min={min} max={max}
            value={selectedTempo} onChange={onChange} />
          <div className={`${classes.sliderMin} ${classes.sliderLabel}`}>{min} BPM</div>
          <div className={`${classes.sliderMax} ${classes.sliderLabel}`}>{max} BPM</div>
        </div>
        <input className={classes.tempoText} type="text" value={selectedTempo} onChange={onChange} />
      </div>
    </div>
  )
}

const renderDoneButton = (onDone) =>
  <div className={classes.expandUp}>
    <div className={classes.bottomRowContent}>
      <button onClick={onDone} className="primary">Done</button>
    </div>
  </div>

export const EditOptions = ({ keySignature, mode, tempo, onOptionChange, onDone }) => {
  const keySignatures = renderKeySignatures(keySignature, mode, onKeyChange.bind(this, onOptionChange))
  const modes = renderMode(mode, onModeChange.bind(this, onOptionChange))
  const tempoElems = renderTempo(tempo, onTempoChange.bind(this, onOptionChange))

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
