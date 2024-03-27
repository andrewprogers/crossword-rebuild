import React from 'react';
import './ClueEditorRow.css'

const ClueEditorRow = ({
  gridnum,
  onChange,
  clueText,
  setGridActive
}) => {
  let displayNumber = gridnum.toString().padStart(3, "\u00A0")
  return(
    <div 
      className="clue-editor-row"
      style={{
        fontFamily: "'Roboto Mono', courier, monospace"
      }}
    >
      <span className="clue-gridnum">{displayNumber}.</span>
      <input
        onChange={onChange}
        value={clueText}
        onFocus={() => setGridActive(false)}
        onBlur={() => setGridActive(true)}
      ></input>
    </div>
  )
}

export default ClueEditorRow;
