import {createBrowserRouter, Route, Link} from 'react-router-dom'
import App from './App'

const router= createBrowserRouter([
    {
      path: "/",
      element: (
        <App />
      ),
      children: [
        {
            path: "/",
            element: (
                <h1>This is the title page</h1>
            )
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