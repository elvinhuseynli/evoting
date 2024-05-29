// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Admin from './components/admin/Admin';
import User from './components/user/User';
import './App.css';

function Welcome() {
  return (
    <div className="welcome-container">
      <h1 className="welcome-header">Welcome to the Voting DApp</h1>
      <p className="welcome-text">Select a role to proceed:</p>
      <div className="button-container">
        <Link to="/admin"><button className="welcome-button">Admin Page</button></Link>
        <Link to="/user"><button className="welcome-button">User Page</button></Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
