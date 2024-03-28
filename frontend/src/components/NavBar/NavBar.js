import {Link} from 'react-router-dom'
import './NavBar.css'
import {useContext} from 'react'
import { UserContext } from '../../context/UserContext';

const NavBar = () => {
  const user = useContext(UserContext)

  const navLinks = [
    { text: "Play", to:"/puzzles", requiresAuth: false },
    { text: "Create", to:`/puzzles/new`, requiresAuth: true },
    { text: "My Puzzles", to:`/puzzles/user/${user.user_id}`, requiresAuth: true }
  ].filter(l => !l.requiresAuth || user.logged_in )
  .map(l => <Link to={l.to} key={l.to} className="nav-link">{l.text}</Link>)

  let authFragment = <Link to="/auth/login" id="sign_in" className="nav-link sign-in" reloadDocument={true}>Sign in</Link>
  if (user.logged_in) {
    authFragment = <>
      <Link to="/auth/logout" className="nav-link" reloadDocument={true}>Sign Out</Link>
      <span id="user-name">{`${user.given_name} ${user.family_name}`}</span>
      <img src={user.picture} className="avatar" referrerPolicy="no-referrer"/>
    </>
  }
  return(
    <div className="top">
      <div className="title">
        <Link to="/" id="title" >Cross Reaction</Link>
      </div>
      <div className="top-left">
        {navLinks}
      </div>
      <div className="top-right">
        {/* <% if current_user %>
          <%= link_to "Sign Out", '/signout' , class: "nav-link"%>
          <span id="user-name"><%= current_user.name %></span>
          <%= image_tag current_user.avatar_url, class: "avatar" unless current_user.avatar_url.nil? %>
        <% else %>
          <%= link_to "Sign in with Google", '/auth/google_oauth2', id: "sign_in", class: "nav-link sign-in" %>
        <% end %> */}
        {authFragment}
      </div>
    </div>
  )
}

export default NavBar;