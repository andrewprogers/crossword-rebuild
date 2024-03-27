import React from 'react';
import {clueBoxStyle} from './styles'

const Clues = ({
  crossword,
  type,
  clues,
  clueDirection,
  selectedCellRow,
  selectedCellColumn,
  updateSelectedCell,
  changeClueDirection
}) => {
  let styles = [clueBoxStyle]
  if (clueDirection === type) {
    styles.push({
      borderColor: "#F4B905",
      color: "black"
    })
  } else {
    styles.push({
      borderColor: "#FFEAA8",
      color: "#444"
    })
  }

  let label = type.charAt(0).toUpperCase() + type.slice(1);

  let clueCell = crossword.getSelectedClue(clueDirection, selectedCellRow, selectedCellColumn);
  let selected = clueCell.gridNum;
  let clueItems = clues.map((clueObj, index) => {
    let isSelected = (selected === clueObj.gridNum && clueDirection === type);
    let clickHandler = () => {
      updateSelectedCell(clueObj.row.start, clueObj.column.start)
      if (clueDirection !== type) {
        changeClueDirection(type)
      }
    }
    return(
      <li
        key={index}
        onClick={clickHandler}
        style={{
          listStyle: "none",
          paddingLeft: 5,
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
          borderBottomColor: (isSelected) ? "rgb(255, 99, 32)" : "#FFEAA8"
        }}
      >{`${clueObj.gridNum}. ${clueObj.text}`}</li>
    )
  })

  return(
    <div className='clue-box' style={Object.assign({}, ...styles)}>
      <h3 style={{ paddingLeft: 5 }}>{label}</h3>
      <div 
        className='clues'
        style={{
          fontSize: "0.9em",
          maxHeight: "500px",
          overflow: "scroll",
          overflowX: "hidden"
        }}>
        <ul style={{marginLeft: 0}}>
          {clueItems}
        </ul>
      </div>
    </div>
  )
}

export default Clues;
