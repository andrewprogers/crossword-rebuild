import { createBrowserRouter, Route, Link } from 'react-router-dom'
import App from './App'
import LandingPage from './components/LandingPage/LandingPage'
import CrosswordContainer from './components/CrosswordContainer'
import NewPuzzle, { action as createPuzzle } from './components/NewPuzzle'
import ErrorPage from './components/ErrorPage'
import PuzzleIndex from './components/PuzzleIndex'

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App />
    ),
    // catch and redirect general 404s to /error route with layout :
    errorElement: <ErrorPage redirectPath="/error" />, 
    children: [{
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <LandingPage />
        },
        {
          path: "/puzzles",
          element: <PuzzleIndex />,
          loader: async () => {
            let res = await fetch(`/api/puzzle/`)
            let json = await res.json()
            return json
          }
        },
        {
          path: "/puzzles/user",
          element: <PuzzleIndex />,
          loader: async () => {
            let res = await fetch(`/api/puzzle/user`)
            let json = await res.json()
            return json
          }
        },
        {
          path: "/puzzles/:puzzleId",
          element: (<CrosswordContainer />),
          loader: async ({ params: { puzzleId } }) => {
            let res = await fetch(`/api/puzzle/${puzzleId}`)
            if (res.ok) {
              let json = await res.json()
              return json
            } else {
              throw new Error("Error retrieving puzzle data for puzzle id: " + puzzleId)
            }
          }
        },
        {
          path: "/puzzles/new",
          element: <NewPuzzle />,
          action: createPuzzle
        },
        {
          path: "/error",
          element: <ErrorPage />
        }
      ]
    }]
  },
]);

export default router;