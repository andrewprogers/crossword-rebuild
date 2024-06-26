import React from "react";
import { useLoaderData } from "react-router-dom";
import './PuzzleIndex.css'
import {Link} from 'react-router-dom'
import squares from '../images/squares.png'

const PuzzleTile = ({ puzzle }) => {
    let author;
    if (puzzle.user_name){
        author = <span className="author-name"><br />{puzzle.user_name}</span>
    }
    return (
        <Link to={puzzle.url}>
            <div className="puzzle-tile">
                <img src={squares} alt="crossword grid" />
                <div className="title-container">
                    <span><b>{puzzle.title}</b></span>
                    {author}
                </div>
            </div>
        </Link>
    )
}

const PuzzleColumn = ({
    column_title,
    puzzles,
    placeholder
}) => {
    let content;
    if (puzzles.length > 0) {
        const puzzle_tiles = puzzles.map(p => <PuzzleTile key={p.id} puzzle={p} />)
        content = <div className="puzzle-tile-container">{puzzle_tiles}</div>
    } else {
        content = <div className="no-results"><p>{placeholder}</p></div>
    }

    return (
        <div className="small-12 medium-12 large-12 columns">
            <h3>{column_title}</h3>
            {content}
        </div >
    )
}

const PuzzleIndex = () => {
    const data = useLoaderData()

    let content;
    if ("user_id" in data) {
        const {in_progress, created, draft} = data;
        content = (<>
            <PuzzleColumn
                column_title="Puzzles In Progress"
                placeholder="No Unfinished Puzzles!"
                puzzles={in_progress} />
            <PuzzleColumn
                column_title="Published Puzzles"
                placeholder="You haven't published any puzzles yet!"
                puzzles={created} />
            <PuzzleColumn
                column_title="Drafts"
                placeholder="You don't have any drafts right now!"
                puzzles={draft} />
        </>)
    } else {
        const {recent} = data;
        content = (
            <PuzzleColumn
                column_title="Recent Puzzles"
                placeholder="No puzzles to play yet!"
                puzzles={recent} />
        )
    }

    return (
        <div id="puzzle-index-wrapper">
            <div className="row">
                {content}
            </div>
        </div>
    )
}

export default PuzzleIndex;
