import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../static/navbar.css';
import logo from '../static/images/raysoniclogo.png';

function Navbar({ username, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div>
      <div className="image_container">
        <img src={logo} alt="Login" className="navbarlogo" />
      </div>
     
      <div className="left_bottom" id="left_bottomid">
        <div className="up">
          
          <Link to="/homepage" className={`nav_link ${isActive('/homepage') ? 'active' : '' }` }>
          <i class="fa-solid fa-house"></i> Dashboard
          </Link>
          <Link to="/monitor" className={`nav_link ${isActive('/monitor') ? 'active' : ''}`}>
            <i className="fas fa-tv"></i> Monitor
          </Link>
          <Link to="/location" className={`nav_link ${isActive('/location') ? 'active' : ''}`}>
            <i className="fas fa-map-marker-alt"></i> Maps
          </Link>
          <Link to="/gradio" className={`nav_link ${isActive('/gradio') ? 'active' : ''}`}>
          <i class="fa-solid fa-paint-roller"></i> Composite Sketch 
          </Link>
          <Link to="/cctvpage" className={`nav_link ${isActive('/cctvpage') ? 'active' : '' }` }>
          <i class="fa-solid fa-plus"></i>Register CCTV
          </Link>
          
        </div>
        <div className="bottom">
          <button className="nav_link logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
