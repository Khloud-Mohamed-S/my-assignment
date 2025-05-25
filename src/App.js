<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Documentmanager from "./pages/Documentmanager"
=======
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import DMSDashboard from './pages/DMSDashboard'; // Import the unified dashboard
>>>>>>> 5af20f1e70c7c9f68b24a3527e15f4c7ec9cec37

const App = () => {
  return (
    <Router>
      <div className="p-4">
<<<<<<< HEAD
        <Routes>
          <Route path="/" element={<Documentmanager/>} />
=======
        <nav className="mb-4">
          <Link to="/" className="text-primary h5 text-decoration-none">Document Management System</Link>
        </nav>
        <Routes>
          {/* Redirect root path to the dashboard */}
          <Route path="/" element={<DMSDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
>>>>>>> 5af20f1e70c7c9f68b24a3527e15f4c7ec9cec37
        </Routes>
      </div>
    </Router>
  );
};

export default App;
