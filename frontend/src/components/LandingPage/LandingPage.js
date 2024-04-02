import grid from '../../images/grid.png'
import github_mark from '../../images/github_mark.png'
import linked_in_mark from '../../images/linked_in_mark.png'
import {Link} from 'react-router-dom'

import './LandingPage.css'

const LandingPage = () => {
    return(
        <>
            <div className="main-image">
                <img src={grid} alt="crossword grid decorative background"/>
                <div className="try-now">
                    <Link to="/puzzles/random" >Play Now</Link>
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
                    <img src={github_mark} alt="Github Icon"/>
                    </a>
                    <a href="https://www.linkedin.com/in/andrew-paul-rogers/">
                    <img src={linked_in_mark} alt="Linked-In Icon"/>
                    </a>

                </div>
            </div>
        </>
    )
}

export default LandingPage;