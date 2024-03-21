import grid from './grid.png'
import github_mark from './github_mark.png'
import linked_in_mark from './linked_in_mark.png'

import './LandingPage.css'

export default () => {
    return(
        <>
            <div className="main-image">
                <img src={grid} />
                <div className="try-now">
                    <a href="/puzzles/random" >Play Now</a>
                </div>
            </div>

            <div className="lower columns">
                <div className="small-12 small-centered columns">
                    <h3>Welcome to Cross Reaction!</h3>
                    <p>
                    Cross Reaction is a modern browser-based interface for solving and creating crossword puzzles. The puzzles found here are community contributed. Tools are available to help first-time constructors and pros alike build puzzles to share.
                    You'll get the most out of this site by signing in so that we can save your solutions and drafts.
                    </p>
                    <br />
                    <p>
                    This app was built by Andrew Rogers while at Launch Academy.
                    </p>
                    <a href="https://github.com/andrewprogers/crossword-react-on-rails">
                    <img src={github_mark} />
                    </a>
                    <a href="https://www.linkedin.com/in/andrew-paul-rogers/">
                    <img src={linked_in_mark} />
                    </a>

                </div>
            </div>
        </>
    )
}