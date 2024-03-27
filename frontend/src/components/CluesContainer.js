import Clues from './Clues';
import CluesEditor from './CluesEditor'


const CluesContainer = ({
  crossword,
  selectedCellRow,
  selectedCellColumn,
  clueDirection,
  editMode,
  updateSelectedCell,
  changeClueDirection,
  updateClues,
  setGridActive
}) => {


  //   componentDidUpdate(prevProps, prevState) {
  //     if (!this.props.editMode) {
  //       let startingScrollY = window.scrollY;
  //       let selected = document.getElementsByClassName('selected');
  //       selected[0].scrollIntoView();
  //       window.scrollTo(0, startingScrollY);
  //     }
  //   }

  let cluesByDirection = [
    { direction: "across", clues: crossword.getAcrossClues() },
    { direction: "down", clues: crossword.getDownClues() }
  ]

  let clueSets = cluesByDirection.map(item =>
    <div className="small-6 columns" style={{ padding: "0px 5px" }} key={item.direction}>
      {editMode ?
        <CluesEditor
          crossword={crossword}
          type={item.direction}
          clues={item.clues}
          updateClues={updateClues}
          setGridActive={setGridActive}
        />
        : // else not in edit mode:
        <Clues
          crossword={crossword}
          type={item.direction}
          clues={item.clues}
          clueDirection={clueDirection}
          selectedCellRow={selectedCellRow}
          selectedCellColumn={selectedCellColumn}
          updateSelectedCell={updateSelectedCell}
          changeClueDirection={changeClueDirection}
        />
      }
    </div>
  )

  return (
    <div id='clues-container' style={{ marginTop: 5 }}>
      {clueSets}
    </div>
  )
}

export default CluesContainer;
