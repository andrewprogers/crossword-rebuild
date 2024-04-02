import React, {useState, useRef} from 'react';
import {unselectableStyle} from './styles'

const LONG_PRESS_MS = 500;
const cellStyle = {
  borderRight: "1px solid #555",
  borderBottom: "1px solid #555",
  width: "10%",
  boxSizing: "border-box",
  fontSize: "25px",
  textAlign: "center",
  paddingTop: "0px",
  color: "#444"
}

const shadedStyle ={
  backgroundColor: "#222"
}

const revealedLetter = {
  color: "#CF4332"
}

const selectedClueStyle = {
  backgroundColor: "#FFD658"
}

const selectedCellStyle = {
  backgroundColor: "#FFA985"
}

const Cell = ({
  crossword,
  row,
  column,
  puzzleRevealed,
  selectedCellRow,
  selectedCellColumn,
  selectedClue,
  width,
  handleMouseClick
}) => {
  let letter;
  let gridLetter = crossword.grid[row][column];
  let userLetter = crossword.userLetters[row][column];

  let pctWidth = 100 / crossword.grid[0].length;
  let pctHeight = 100 / crossword.grid.length;

  let cellSizeStyle = {
    width: `${pctWidth}%`,
    height: `${pctHeight}%`,
    fontSize: width/1.3
  }

  let styles = [cellStyle, cellSizeStyle, unselectableStyle]

  if(gridLetter === '.') {
    letter = '';
    styles.push(shadedStyle);
  } else if (puzzleRevealed){
    letter = gridLetter;
    if (letter !== userLetter) {
      styles.push(revealedLetter)
    }
  } else {
    letter = crossword.userLetters[row][column];
  }

  let clickHandler = (e) => {
    e.preventDefault();
    let currentCell = {
      row: row,
      column: column
    }
    let toggleBlack = e.altKey || e.metaKey || e.ctrlKey || e.shiftKey
    handleMouseClick(currentCell, toggleBlack)
  };

  let longPressTimeout = useRef(null)
  let handleLongPress = (event, isStart) => {
    if (longPressTimeout.current !== null) { 
      clearTimeout(longPressTimeout.current)
      longPressTimeout.current = null
    }
    if (isStart) {
      longPressTimeout.current = setTimeout(() => {
        handleMouseClick({
          row: row,
          column: column
        }, true)
      }, LONG_PRESS_MS)
    }
  }

  if (((row >= selectedClue.rowStart) && (row <= selectedClue.rowEnd))
      && ((column >= selectedClue.columnStart) && (column <= selectedClue.columnEnd))) {
    styles.push(selectedClueStyle)
  }

  if ((selectedCellRow === row) && (selectedCellColumn === column)) {
    styles.push(selectedCellStyle)
  }

  let number = crossword.getGridNums()[row][column]
  let displayNumber = (number) ? number : '';
  return(
    <div 
      className='cell'
      onClick={clickHandler}
      onTouchStart={(e) => handleLongPress(e, true)}
      onTouchMove={(e) => handleLongPress(e, false)}
      onTouchCancel={(e) => handleLongPress(e, false)}
      onTouchEnd={(e) => handleLongPress(e, false)}
      style={Object.assign({}, ...styles)}
    >
      <div 
        className="cell-number"
        style={{
          position: "absolute",
          paddingTop: "0.2%",
          paddingLeft: "0.3%",
          textAlign: "left",
          fontSize: "0.3em",
          color: "#444"
        }}
      >{displayNumber}</div>
      <div
        className="cell-letter"
        style={{
          padding: "0",
          paddingTop: "20%",
          margin: "0px 0px -100px 0px",
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "inherit",
          boxShadow: "none",
          fontSize: "inherit",
          transition: "none",
          textAlign: "center",
          cursor: "default"
        }}
        onKeyDownCapture={(e) => {console.error("TODO handle key down in cell")}}>{letter}</div>
    </div>
  )
}

export default Cell;
