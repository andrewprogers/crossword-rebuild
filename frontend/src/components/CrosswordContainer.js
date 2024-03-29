




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


import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom"
import Crossword from '../modules/Crossword'
import CrosswordGrid from './CrosswordGrid';
import CluesContainer from "./CluesContainer";
import UserActionController from "../modules/UserActionController";
import PuzzleMenu from "../containers/PuzzleMenu"
import Swal from 'sweetalert2'
import {debounce, grid_iter} from '../modules/utilities'

const debouncedPatch = debounce(async (endpoint, payload) => {
  try {
    const response = await fetch(endpoint, payload)
    if (response.status === 401) {
      let json = await response.json()
      if ('redirect_url' in json) {
        console.log("Unauthenticated, redirecting")
        window.location = json.redirect_url
      } else {
        throw new Error("401 API response missing redirect_url")
      }
    } else if (!response.ok) {
      throw new Error(`Unexpected response: ${response.statusText}`)
    } else {
      // happy path
    }
  } catch (error) {
    console.error("Unhandled error while attempting to save solution", error)
  }
}, 1000)

const findInitialCell = (grid) => {
  for (let {r, c, el} of grid_iter(grid)) {
    if (el !== '.') return { row: r, col: c }
  }
}

const CrosswordContainer = () => {
  const {puzzle, solution} = useLoaderData()

  // Derive initial state from loaded puzzle
  const initialGrid = puzzle.grid;
  let initialSolution;
  let solveStatus = false;

  if (solution) {
    initialSolution = solution.user_answers;
    solveStatus = solution.is_solved
  } else {
    initialSolution = Crossword.generateEmptyGrid(puzzle.size.rows);
  }

  if (puzzle.draft) {
    initialSolution = Crossword.generateEmptyGrid(puzzle.size.rows);
    for (let {r, c, el} of grid_iter(initialGrid)) {
      if (el !== '.') {
        initialSolution[r][c] = initialGrid[r][c];
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
  const editMode = useState(puzzle.draft)[0]
  const [puzzleTitle, setPuzzleTitle] = useState(puzzle.title)
  const [puzzleRevealed, setPuzzleRevealed] = useState(false)
  // gridActive is false when editing another field b/c we need to not prevent input
  const [gridActive, setGridActive] = useState(true) 
  const [puzzleEdited, setPuzzleEdited] = useState(false)

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

  const controller = new UserActionController({
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
    if ("grid" in newState) { 
      setGrid(newState.grid) 
      setPuzzleEdited(true)
    }
    if ("clues" in newState) { 
      setClues(newState.clues)
      setPuzzleEdited(true)
    }
    if ("userLetters" in newState) { 
      setUserLetters(newState.userLetters) 
      setPuzzleEdited(true)
    }
    if ("selectedCellRow" in newState) { setSelectedCellRow(newState.selectedCellRow) }
    if ("selectedCellColumn" in newState) { setSelectedCellColumn(newState.selectedCellColumn) }
    if ("clueDirection" in newState) { setClueDirection(newState.clueDirection) }
    if ("isSolved" in newState) { 
      setIsSolved(newState.isSolved)
      setPuzzleEdited(true)
    }

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
        if (isCrosswordKeyboardInput(event)) {
          event.preventDefault()
          let newState = controller.keyPress(event.key, event.shiftKey)
          handleStateUpdates(newState)
        }
      }
      window.addEventListener('keydown', capture)
      return () => {window.removeEventListener('keydown', capture)}
    }
  }, [gridActive, controller])

  const handleMouseClick = (clickedCell, toggleBlack) => {
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
      handleStateUpdates(controller.clear())
    }
  }

  // Functions for handling saving changes

  const patchPayload = () => {
    let body;
    if (editMode) {
      let gridUpdate = Crossword.generateEmptyGrid(grid.length)
      for (var row = 0; row < grid.length; row++) {
        for (var col = 0; col < grid.length; col++) {
          if (grid[row][col] === ".") {
            gridUpdate[row][col] = '.'
          } else if (userLetters[row][col].match(/[A-Z]/)) {
            gridUpdate[row][col] = userLetters[row][col]
          } else {
            gridUpdate[row][col] = ' '
          }
        }
      }
      body = {
        grid_update: gridUpdate,
        title_update: puzzleTitle,
        clues_update: clues
      }
    } else {
      body = {
        user_solution: userLetters,
        is_solved: isSolved
      }
    }
    return {
      method: "PATCH",
      credentials: "same-origin",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body)
    }
  }

  const apiEndpoint = (mode) => {
    if (mode === 'publish'){
      return `/api/v1/puzzles/${puzzle.id}/publish`
    }
    if (editMode) {
      return `/api/puzzle/${puzzle.id}`
    } else {
      return `/api/solution/${solution.id}`
    }
  }

  useEffect(() => {
    if (!puzzleEdited) { return }
    let payload = patchPayload()
    if(solution) {
      debouncedPatch(apiEndpoint(), payload)
    }
  }, [grid, userLetters, puzzleTitle, clues, isSolved, puzzleEdited])

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
