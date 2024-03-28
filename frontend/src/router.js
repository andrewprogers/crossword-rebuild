import {createBrowserRouter, Route, Link} from 'react-router-dom'
import App from './App'
import LandingPage from './components/LandingPage/LandingPage'
import CrosswordContainer from './components/CrosswordContainer'
import NewPuzzle, {action as createPuzzle} from './components/NewPuzzle'

const router= createBrowserRouter([
    {
      path: "/",
      element: (
        <App />
      ),
      children: [
        {
            path: "/",
            element: <LandingPage />
        },
        {
            path: "/puzzles/:puzzleId",
            element: (<CrosswordContainer />),
            loader: async ({ params: { puzzleId }}) => {
              let res = await fetch(`/api/puzzle/${puzzleId}`)
              if (res.ok) {
                let json = await res.json()
                console.log(json)
                return json
              } else {
                console.error("Error retrieving puzzle data")
              }
            }
        },
        {
          path: "/puzzles/new",
          element: <NewPuzzle />,
          action: createPuzzle
        }
      ]
    },
]);

export default router;