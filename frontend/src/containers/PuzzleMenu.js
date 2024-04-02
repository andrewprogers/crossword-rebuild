import {useState} from 'react';
import MenuButton from '../components/MenuButton'
import PuzzleTitle from '../components/PuzzleTitle'
import InfoContainer from '../components/InfoContainer'

const getMatchingWords = async (pattern) => {
  const res = await fetch(`/api/words/search?pattern=${pattern}`)
  let words = []
  if (res.ok) {
    words = (await res.json()).words
  }
  return {
    words,
    status: (words.length > 0) ? "Matches" : "Couldn't match your pattern!"
  }
}

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

  const matchPattern = async () => {
    let userPattern = crossword.getUserPattern(clueDirection, selectedCellRow, selectedCellColumn)
    let matchPattern = userPattern.replace(/ /g, "?");
    setStatus(`Searching: ${matchPattern}`)
    setWords([])
    setWordData(null)
    const {words, status} = await getMatchingWords(matchPattern)
    setStatus(status)
    setWords(words)
  }



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
      <MenuButton key="MATCH" name="MATCH" onClick={() => matchPattern()} />
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
