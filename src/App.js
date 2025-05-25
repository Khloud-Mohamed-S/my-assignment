import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Documentmanager from "./pages/Documentmanager"
import React from 'react';
const App = () => {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Documentmanager/>} />
        <Routes>
      </div>
    </Router>
  );
};

export default App;
