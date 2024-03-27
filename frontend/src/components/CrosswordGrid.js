import { useEffect, useRef, useState } from 'react';
import Cell from './Cell';

const CrosswordGrid = ({
  crossword,
  selectedCellRow,
  selectedCellColumn,
  clueDirection,
  puzzleRevealed,
  handleMouseClick
}) => {
  const gridContainer = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      let width = gridContainer.current.getBoundingClientRect().width
      setContainerWidth(width)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => { window.addEventListener('resize', handleResize) }
  }, [gridContainer])

  let selectedClue = crossword.getSelectedClue(clueDirection, selectedCellRow, selectedCellColumn)
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
