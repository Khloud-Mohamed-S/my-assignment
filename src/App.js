import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DMSDashboard from './pages/DMSDashboard'; 

const App = () => {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<DMSDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
