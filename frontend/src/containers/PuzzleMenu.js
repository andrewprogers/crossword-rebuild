import {useState} from 'react';
import MenuButton from '../components/MenuButton'
import PuzzleTitle from '../components/PuzzleTitle'
import InfoContainer from '../components/InfoContainer'


const PuzzleMenu = ({
  crossword,
  selectedCellRow,
  selectedCellColumn,
  clueDirection,
  editMode,
  puzzleRevealed,
  title,

  publishPuzzle,
  toggleReveal,
  updateTitle,
  handleClear,
  setGridActive
}) => {
  const [status, setStatus] = useState("Getting Started")
  const [words, setWords] = useState([])
  const [wordData, setWordData] = useState(null)

  // matchPattern() {
  //   let row = this.props.selectedCellRow
  //   let col = this.props.selectedCellColumn
  //   let userPattern = this.props.crossword.getUserPattern(this.props.clueDirection, row, col)
  //   let matchPattern = userPattern.replace(/ /g, "?");
  //   let matchedWords = this.getMatchingWords(matchPattern)
  //   this.setState({status: `Searching: ${matchPattern}`, words: [], wordData: null})
  // }

  // getMatchingWords(pattern) {
  //   fetch(`${window.location.origin}/api/v1/words?pattern=${pattern}`)
  //   .then(response => {return response.ok ? response.json() : {words: []}})
  //   .then(json => json.words)
  //   .then(words => {
  //     let newState = {words: words}
  //     newState.status = (words.length > 0) ? "Matches" : "Couldn't match your pattern!"
  //     this.setState(newState)
  //   })
  // }

  // getWordAnalysis(word) {
  //   fetch(`${window.location.origin}/api/v1/words/analyze?word=${word}`)
  //   .then(response => {
  //     if (response.ok) {
  //       return response.json()
  //     } else {
  //       throw new Error('Error in fetch, failed to analyze')
  //     }
  //   })
  //   .then(json => this.setState({status: `${word} - Data and selected clues`, wordData: json}))

  //   this.setState({status: `Analyzing: ${word}`, words: [], wordData: null})
  // }

  let editOnlyButtons, playOnlyButtons, infoSection;
  let columnClassNames = "small-12 columns"
  if (editMode) {
    editOnlyButtons = [
      <MenuButton key="PUBLISH" name="PUBLISH" onClick={publishPuzzle} />,
      <MenuButton key="MATCH" name="MATCH" onClick={() => console.error("TODO: Implement pattern match")} />
    ]
    columnClassNames = "small-12 medium-6 columns";
    infoSection = <div className="small-12 medium-6 columns">
      <InfoContainer
        status={status}
        words={words}
        onWordClick={() => console.error("TODO: Implement word analysis")}
        wordData={wordData} />
    </div>
  } else {
    playOnlyButtons = [
      <MenuButton key="REVEAL" name="REVEAL" onClick={toggleReveal} active={puzzleRevealed} />
    ]
  }

  return (
    <div id="puzzle-menu" className="row"
      style={{
        border: "0px solid #444",
        backgroundColor: "#EEE",
        margin: "5px 0px",
        padding: "5px 0px",
        minHeight: "150px"
      }}
    >
      <div className={columnClassNames}>
        <PuzzleTitle
          value={title}
          editMode={editMode}
          onChange={updateTitle} 
          setGridActive={setGridActive}
        />
        <MenuButton name="CLEAR" onClick={handleClear} />
        {editOnlyButtons}
        {playOnlyButtons}
      </div>
      {infoSection}
    </div>
  )

}

export default PuzzleMenu;
