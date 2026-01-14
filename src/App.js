import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PredictionProvider } from './contexts/PredictionContext';
import Dashboard from './components/Dashboard';
import ShortTermForecast from './components/ShortTermForecast';
import LongTermForecast from './components/LongTermForecast';
import './App.css';

function App() {
  return (
    <PredictionProvider>
      <Router>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/">Solar Energy Forecasting</Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link className="nav-link" to="/">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/short-term">Short-Term Forecast</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/long-term">Long-Term Forecast</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/short-term" element={<ShortTermForecast />} />
              <Route path="/long-term" element={<LongTermForecast />} />
            </Routes>
          </div>
        </div>
      </Router>
    </PredictionProvider>
  );
}

export default App;