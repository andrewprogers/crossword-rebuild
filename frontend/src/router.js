import {createBrowserRouter, Route, Link} from 'react-router-dom'
import App from './App'
import LandingPage from './components/LandingPage/LandingPage'

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
            path: "/puzzles",
            element: (
                <h1>Hello World: puzzles</h1>
            )
        }
      ]
    },
]);

export default router;