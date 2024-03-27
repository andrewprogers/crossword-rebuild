




//   publishPayload() {
//     let crossword = new Crossword(this.state.grid, this.state.clues, this.state.userLetters)
//     let acrossNums = crossword.getAcrossClues().map(clue => clue.gridNum)
//     let downNums = crossword.getDownClues().map(clue => clue.gridNum)
//     let clueNumbers = { across: acrossNums, down: downNums }

//     let acrossClues = crossword.getAcrossClues().map(clue => {
//       let answer = ""
//       for (var col = clue.column.start; col <= clue.column.end; col++) {
//         answer += this.state.userLetters[clue.row.start][col]
//       }
//       return answer;
//     })

//     let downClues = crossword.getDownClues().map(clue => {
//       let answer = ""
//       for (var row = clue.row.start; row <= clue.row.end; row++) {
//         answer += this.state.userLetters[row][clue.column.start]
//       }
//       return answer;
//     })
//     let clueAnswers = { across: acrossClues, down: downClues }
//     return({
//       method: "PATCH",
//       credentials: "same-origin",
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         clue_numbers: clueNumbers,
//         clue_answers: clueAnswers
//       })
//     })
//   }

//   publishPuzzle() {
//     if (Crossword.validate(this.state.grid, this.state.clues, this.state.userLetters)) {
//       fetch(this.apiEndpoint('publish'), this.publishPayload())
//       .then(response => response.json())
//       .then(json => {
//         if (json.errors === undefined){
//           window.location = `http://${window.location.host}/puzzles/${json.puzzle_id}`
//         } else {
//           sweetAlert({
//             title: "Publish Error",
//             text: "There was an error publishing your puzzle",
//             type: "error"
//           })
//         }
//       })
//     } else {
//       sweetAlert({
//         title: "Incomplete",
//         text: "Your puzzle is not yet complete! Please make sure to fill in all cells and clues",
//         type: "error"
//       })
//     }
//   }

//   patchPayload() {
//     let body;
//     if (this.state.editMode) {
//       let gridUpdate = Crossword.generateEmptyGrid(this.state.grid.length)
//       for (var row = 0; row < this.state.grid.length; row++) {
//         for (var col = 0; col < this.state.grid.length; col++) {
//           if (this.state.grid[row][col] === ".") {
//             gridUpdate[row][col] = '.'
//           } else if (this.state.userLetters[row][col].match(/[A-Z]/)) {
//             gridUpdate[row][col] = this.state.userLetters[row][col]
//           } else {
//             gridUpdate[row][col] = ' '
//           }
//         }
//       }
//       body = {
//         grid_update: gridUpdate,
//         title_update: this.state.puzzleTitle,
//         clues_update: this.state.clues
//       }
//     } else {
//       body = {
//         user_solution: this.state.userLetters,
//         is_solved: this.state.isSolved
//       }
//     }
//     return {
//       method: "PATCH",
//       credentials: "same-origin",
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(body)
//     }
//   }

//   apiEndpoint(mode) {
//     let puzzle_id = window.location.pathname.split('/')[2]
//     if (mode === 'publish'){
//       return `/api/v1/puzzles/${puzzle_id}/publish`
//     }
//     let solution_api = `/api/v1/users/${this.user_id}/solutions/${this.solution_id}`
//     let puzzles_api = `/api/v1/puzzles/${puzzle_id}`

//     return this.state.editMode ? puzzles_api : solution_api
//   }

//   componentDidUpdate() {
//     let payload = this.patchPayload()
//     if(this.user !== null && payload) {
//       fetch(this.apiEndpoint(), payload)
//       .then(response => response.json())
//     }
//   }

//   }
// }


import React, { useState, useEffect, useRef } from "react";
import { useLoaderData } from "react-router-dom"
import Crossword from '../modules/Crossword'
import CrosswordGrid from './CrosswordGrid';
import CluesContainer from "./CluesContainer";
import UserActionController from "../modules/UserActionController";
import PuzzleMenu from "../containers/PuzzleMenu"
import Swal from 'sweetalert2'



const findInitialCell = (grid) => {
  for (let r = 0; r < grid.length; r++) {
    let row = grid[r]
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== ".") {
        return {
          row: r,
          col: c
        }
      }
    }
  }
}

const CrosswordContainer = () => {
  const {puzzle, solution} = useLoaderData()

  // Derive initial state from loaded puzzle
  const initialGrid = Crossword.parseArrayToGrid(puzzle.grid);
  let initialSolution;
  let solveStatus = false;
  let isDraftPuzzle = false;

  if (solution) {
    initialSolution = Crossword.parseArrayToGrid(solution.user_answers);
    solveStatus = solution.is_solved
  } else {
    initialSolution = Crossword.generateEmptyGrid(puzzle.size.rows);
  }

  if (isDraftPuzzle) {
    initialSolution = Crossword.generateEmptyGrid(puzzle.size.rows);
    for (let row = 0; row < initialGrid.length; row++) {
      for (let col = 0; col < initialGrid.length; col++) {
        if (initialGrid[row][col] !== '.') {
          initialSolution[row][col] = initialGrid[row][col];
        }
      }
    }
  }

  const initialPosition = findInitialCell(initialGrid)

  const [grid, setGrid] = useState(initialGrid)
  const [clues, setClues] = useState(puzzle.clues)
  const [userLetters, setUserLetters] = useState(initialSolution)
  const [selectedCellRow, setSelectedCellRow] = useState(initialPosition.row)
  const [selectedCellColumn, setSelectedCellColumn] = useState(initialPosition.col)
  const [clueDirection, setClueDirection] = useState("across")
  const [isSolved, setIsSolved] = useState(solveStatus)
  const [editMode, setEditMode] = useState(true)
  const [puzzleTitle, setPuzzleTitle] = useState(puzzle.title)
  const [puzzleRevealed, setPuzzleRevealed] = useState(false)
  // gridActive is false when editing another field b/c we need to not prevent input
  const [gridActive, setGridActive] = useState(true) 

  const updateSelectedCell = (row, column) => {
    setSelectedCellRow(row)
    setSelectedCellColumn(column)
  }
  const changeClueDirection = (newDir) => {
    if (newDir === undefined) {
      newDir = (clueDirection === 'across') ? 'down' : 'across'
    }
    setClueDirection(newDir)
  }

  const getUserActionController = () => new UserActionController({
    grid,
    clues,
    userLetters,
    selectedCellRow,
    selectedCellColumn,
    clueDirection,
    isSolved,
    editMode
  })


  const handleStateUpdates = (newState) => {
    if ("grid" in newState) { setGrid(newState.grid) }
    if ("clues" in newState) { setClues(newState.clues) }
    if ("userLetters" in newState) { setUserLetters(newState.userLetters) }
    if ("selectedCellRow" in newState) { setSelectedCellRow(newState.selectedCellRow) }
    if ("selectedCellColumn" in newState) { setSelectedCellColumn(newState.selectedCellColumn) }
    if ("clueDirection" in newState) { setClueDirection(newState.clueDirection) }
    if ("isSolved" in newState) { setIsSolved(newState.isSolved) }
  }

  const handleKeyDown = (event) => {
    let newState = (getUserActionController()).keyPress(event.key, event.shiftKey)
    handleStateUpdates(newState)
  }

  const isCrosswordKeyboardInput = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return false; // so as not to block keyboard commands
    
    if (
      (e.key.match(/[a-zA-Z]/) && e.key.length === 1)
      || (new Set(['Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', ' ']).has(e.key))
    ) return true
    return false
  }

  useEffect(() => {
    if (gridActive) {
      const capture = (event) => {
        console.log(event)
        if (isCrosswordKeyboardInput(event)) {
          event.preventDefault()
          handleKeyDown(event)
        }
      }
      window.addEventListener('keydown', capture)
      return () => {window.removeEventListener('keydown', capture)}
    }
  }, [gridActive, handleKeyDown])

  const handleMouseClick = (clickedCell, toggleBlack) => {
    let controller = getUserActionController()
    handleStateUpdates(controller.mouseClick(clickedCell, toggleBlack))
    setGridActive(true)
  }

  const updateClues = (clueUpdate) => {
    let newClues = Object.assign({}, clues)
    if (clueUpdate.across !== undefined) {
      newClues.across = clueUpdate.across;
    } else {
      newClues.down = clueUpdate.down;
    }
    setClues(newClues)
  }

  const handleClear = async () => {
    let result = await Swal.fire({
      title: "Clear Letters",
      text: "Are you sure you want to clear all letters?",
      showCancelButton: true
    })
    if (result.isConfirmed) {
      handleStateUpdates(getUserActionController().clear())
    }
  }

  let crossword = new Crossword(grid, clues, userLetters);
  return (
    <div id='crossword-container' className="row">
      <div className='small-12 columns'>
        <PuzzleMenu
          crossword={crossword}
          selectedCellRow={selectedCellRow}
          selectedCellColumn={selectedCellColumn}
          clueDirection={clueDirection}
          editMode={editMode}
          puzzleRevealed={puzzleRevealed}
          title={puzzleTitle}
          publishPuzzle={() => console.error("TODO: Implement publish")}
          toggleReveal={() => setPuzzleRevealed(!puzzleRevealed)}
          updateTitle={(newTitle) => setPuzzleTitle(newTitle)}
          handleClear={handleClear}
          setGridActive={setGridActive}
        />
      </div>
      <div className='small-12 large-6 columns'>
        <CrosswordGrid
          crossword={crossword}
          selectedCellRow={selectedCellRow}
          selectedCellColumn={selectedCellColumn}
          clueDirection={clueDirection}
          puzzleRevealed={puzzleRevealed}
          handleMouseClick={handleMouseClick}
        />
      </div>
      <div className='small-12 large-6 columns'>
        <CluesContainer
          crossword={crossword}
          selectedCellRow={selectedCellRow}
          selectedCellColumn={selectedCellColumn}
          clueDirection={clueDirection}
          editMode={editMode}
          updateSelectedCell={updateSelectedCell}
          changeClueDirection={changeClueDirection}
          updateClues={updateClues}
          setGridActive={setGridActive}
        />
      </div>
    </div>
  )
}

export default CrosswordContainer;
