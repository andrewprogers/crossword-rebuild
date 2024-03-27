import React from 'react';
import './PuzzleTitle.css'

const PuzzleTitle = ({
  editMode,
  onChange,
  value,
  setGridActive
}) => {
  let changeHandler = () => {}
  let inputClass;

  if (editMode) {
    changeHandler = (event) => {
      onChange(event.target.value);
    }
    inputClass = "editable"
  }

  return(
    <div id="puzzle-title"
      style={{
        margin: 5,
        marginLeft: 0,
        paddingLeft: 0
      }} >
      <input
        type="text"
        id="title-input"
        value={value}
        className={inputClass}
        onChange={changeHandler}
        onFocus={() => setGridActive(false)}
        onBlur={() => setGridActive(true)} />
    </div>
  )
}

export default PuzzleTitle;
