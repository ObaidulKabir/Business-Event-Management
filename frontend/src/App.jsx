import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Contacts from './pages/Contacts'
import Reports from './pages/Reports'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>Business Event Manager</h1>
          </div>
          <ul className="nav-menu">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/contacts">Contacts</Link></li>
            <li><Link to="/reports">Reports</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
