import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import Dashboard3 from './components/Dashboard3';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Monitor from './components/Monitor';
import LoginForm from './components/Login'; // Ensure this path is correct
import SignupForm from './components/Signup'; // Import the Signup form
import Topbar from './components/Topbar';
import GradioApp from './components/GradioApp'; // Import the GradioApp component
import CctvForm from './components/CctvPage';
import MapsComponent from './components/MapsComponent'; // Import the Maps component
import PoliceStationsMap from './components/Policestationmap';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(''); // Store username here

  const handleLogin = (username) => {
    setIsAuthenticated(true); // Set authentication status to true
    setUsername(username);    // Store the username
  };

  const handleLogout = () => {
    setIsAuthenticated(false); // Set authentication status to false
    setUsername(''); // Clear the username on logout
  };

  return (
    <Router>
      <Routes>
        {/* Route for login */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginForm onLogin={handleLogin} /> : <Navigate to="/homepage" />}
        />

        {/* Route for signup */}
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupForm /> : <Navigate to="/homepage" />}
        />
  
        {/* Protected routes */}
        <Route
          path="/homepage"
          element={isAuthenticated ? (
          
            <div className="box">
            
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
           
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <Dashboard3 />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

        <Route
          path="/monitor"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <Monitor />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

      <Route
          path="/location"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
             <MapsComponent/> 
            {/* <PoliceStationsMap/>*/}
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


        {/* Route for Gradio app */}
        <Route
          path="/gradio"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <GradioApp />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

      <Route
          path="/cctvpage"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <CctvForm/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />
        

        {/* Redirect to login if no other route matches */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
