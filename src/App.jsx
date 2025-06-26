import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';    
import CreateEvent from './pages/CreateEvent';
import MyRegistrations from './pages/MyRegistrations';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
          <div className="navbar-center">
            <div className="logo">
              <span className="color1">Even</span>
              <span className="color2">Ts</span>
              <span className="color3">APP</span>
            </div>
          </div>
          {menuOpen && (
            <div className="navbar-menu">
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)}>Events</Link> {/* /events */}
              <Link to="/create" onClick={() => setMenuOpen(false)}>Create Event</Link>
              <Link to="/registrations" onClick={() => setMenuOpen(false)}>My Registrations</Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </nav>

        {/* Hero section that wraps everything below the navbar */}
        <div className="hero">
          <Routes>
            <Route path="/" element={
              <>
                <h1>Welcome to Events App</h1>
                <p>Manage your events easily!</p>
              </>
            } />
            <Route path="/events" element={<Events />} /> {/* Correct path and component */}
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/registrations" element={<MyRegistrations />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
           
          </Routes>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} Events App. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;





