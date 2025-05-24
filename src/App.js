// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import DMSDashboard from './pages/DMSDashboard'; // Import the unified dashboard

const App = () => {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4">
          <Link to="/" className="text-primary h5 text-decoration-none">Document Management System</Link>
        </nav>
        <Routes>
          {/* Redirect root path to the dashboard */}
          <Route path="/" element={<DMSDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
