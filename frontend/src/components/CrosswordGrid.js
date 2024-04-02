import { useEffect, useRef, useState } from 'react';
import Cell from './Cell';

const CrosswordGrid = ({
  crossword,
  selectedCellRow,
  selectedCellColumn,
  clueDirection,
  puzzleRevealed,
  handleMouseClick,
  inputRef
}) => {
  const gridContainer = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (gridContainer.current !== null) {
      const handleResize = () => {
        let width = gridContainer.current.getBoundingClientRect().width
        setContainerWidth(width)
      }
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => { window.removeEventListener('resize', handleResize) }
    }
  })

  let selectedClue = crossword.getSelectedClue(clueDirection, selectedCellRow, selectedCellColumn)
  let selectedCellTop = (containerWidth / crossword.userLetters.length)*selectedCellRow
  let cells = crossword.userLetters.map((row, rIndex) => {
    let cellRow = row.map((_, cIndex) => {
      return (
        <Cell
          key={rIndex + " " + cIndex}
          crossword={crossword}
          row={rIndex}
          column={cIndex}
          selectedCellRow={selectedCellRow}
          selectedCellColumn={selectedCellColumn}
          selectedClue={selectedClue}
          puzzleRevealed={puzzleRevealed}
          width={containerWidth/crossword.grid[0].length}
          handleMouseClick={handleMouseClick}
        />
      )
    })
    return cellRow;
  })

  return (
    <div
      className="scale-container"
      style={{
        position: "relative",
        height: "0",
        paddingBottom: "100%"
      }}
    >
      <input 
          autoFocus={true}
          spellCheck={false}
          type="text"
          value=""
          onChange={() => {}}
          ref={inputRef}
          maxLength={1}
          style={{
            transformOrigin: "top left",
            transform: "scale(0)",
            position: "absolute",
            top: `${selectedCellTop}px`
          }}
        />
      <div
        id="grid-container"
        ref={gridContainer}
        style={{
          border: "1px solid #444",
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          lineHeight: "1"
        }}
      >
        {cells}
      </div>
    </div>
  )
}

export default CrosswordGrid;
