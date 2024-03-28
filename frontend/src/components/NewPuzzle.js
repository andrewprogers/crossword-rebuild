import React from "react";
import { Form, redirect, useActionData } from 'react-router-dom'
import './NewPuzzle.css'

const NewPuzzle = () => {
    const data = useActionData()
    console.log(data)
    const title = data?.title || ""
    const titleError = data?.titleError
    const size = data?.size || 10
    const sizeError = data?.sizeError

    return (
        <div className="row" id="new-puzzle">
            <h1>Create a new puzzle</h1>
            <Form method="post">
                <label htmlFor="title">Title</label>
                <input type="text" name="title" defaultValue={title} required />
                <span className="form-error is-visible">{titleError}</span>

                <label htmlFor="size">Size (5-25 rows)</label>
                <input type="number" name="size" min={5} max={25} defaultValue={size} required />
                <span className="form-error is-visible">{sizeError}</span>

                <button type="submit" className="submit-button">Create Crossword</button>
            </Form>
        </div>
    )
}

const validate_new_puzzle = (title, size) => {
    let valid = true
    let titleError, sizeError = (null, null)
    title = title.trim()

    if (title.length < 1 || title.length > 50) {
        titleError = "Puzzle title must be between 1 and 50 characters"
        valid = false
    }
    if (size < 5 || size > 25) {
        sizeError = "Puzzle size must be between 5 and 25"
        valid = false
    }
    return { valid, title, titleError, size, sizeError }
}

const createFail = (validation) => ({
    created: false,
    puzzleId: null,
    formData: validation
})

const createPuzzle = async (title, size) => {
    const validation = validate_new_puzzle(title, size)
    if (!validation.valid) { return createFail(validation) }

    const body = { title: validation.title, size: validation.size }
    const payload = {
        method: "POST",
        credentials: "same-origin",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }

    const response = await fetch('/api/puzzle/create', payload)
    let json = await response.json()
    console.log('json', json)
    return {
        created: true,
        puzzleId: json.puzzle_id
    }
}

export const action = async ({ request, params }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    let result = await createPuzzle(data.title, data.size)
    if (!result.created) {
        return result.formData
    } else {
        console.log('result', result)
        return redirect(`/puzzles/${result.puzzleId}`);
    }
}

export default NewPuzzle;