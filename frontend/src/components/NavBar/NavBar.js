import React from 'react'
import {Link} from 'react-router-dom'
import './NavBar.css'

const NavBar = () => {
  return(
    <div className="top">
      <div className="title">
        <Link to="/" id="title" >Cross Reaction</Link>
      </div>
      <div className="top-left">
        <Link to="/puzzles" className="nav-link" >Play</Link>
        {/* <% if current_user %>
          <%= link_to "Create", new_puzzle_path, class: "nav-link" %>
          <%= link_to "My Puzzles", user_puzzles_path(current_user), class: "nav-link" %>
        <% end %> */}
      </div>
      <div className="top-right">
        {/* <% if current_user %>
          <%= link_to "Sign Out", '/signout' , class: "nav-link"%>
          <span id="user-name"><%= current_user.name %></span>
          <%= image_tag current_user.avatar_url, class: "avatar" unless current_user.avatar_url.nil? %>
        <% else %>
          <%= link_to "Sign in with Google", '/auth/google_oauth2', id: "sign_in", class: "nav-link sign-in" %>
        <% end %> */}
        <Link to="/auth/login" id="sign_in" className="nav-link sign-in" reloadDocument={true}>Sign in</Link>
      </div>
    </div>
  )
}

export default NavBar;