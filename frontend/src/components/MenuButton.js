import React from 'react';
import './MenuButton.css'

const MenuButton = ({
  active,
  onClick,
  name
}) => {
  let className = active ? "menu-button active" : "menu-button"
  return(
    <div className={className} onClick={onClick}>
      <div className='menu-name'>{name}</div>
    </div>
  )
}

export default MenuButton;
