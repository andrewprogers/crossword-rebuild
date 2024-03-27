import React from 'react';
import ClueEditorRow from './ClueEditorRow'
import {clueBoxStyle} from './styles'


const CluesEditor = ({
  type,
  clues,
  updateClues,
  setGridActive
}) => {
  let label = type.charAt(0).toUpperCase() + type.slice(1);

  let clueEditorRows = clues.map((clue, index) => {
      let changeHandler = (event) => {
        let newClues = clues.map(clue => clue.text)
        newClues[index] = event.target.value
        updateClues(
          (type === 'across') ? { across: newClues } : { down: newClues }
        )
      }

      return (
        <ClueEditorRow
          key={clue.gridNum}
          gridnum={clue.gridNum}
          clueText={clue.text}
          onChange={changeHandler}
          setGridActive={setGridActive}
        />
      );
    })

  return (
    <div className='clue-box'
      style={clueBoxStyle}>
      <h3>{label}</h3>
      <div 
        className='clues'
        style={{
          fontSize: "0.9em",
          maxHeight: "500px",
          overflow: "scroll",
          overflowX: "hidden"
        }}>
        {clueEditorRows}
      </div>
    </div>
  )
}

export default CluesEditor;
