import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // 1. MAKE SURE THIS IS IMPORTED

import Home from './pages/Home';
import SkinTypeAssessment from './pages/SkinTypeAssessment';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase'; 
import ProgressTracker from './pages/ProgressTracker';
import Signup from './pages/Signup';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>
        
        {/* PUBLIC ROUTES: Anyone can access these */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* PROTECTED ROUTES: Only logged-in users can access these */}
        {/* 2. MAKE SURE THIS WRAPPER IS AROUND YOUR PRIVATE PAGES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/assessment" element={<SkinTypeAssessment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<KnowledgeBase />} />
          <Route path="/tracker" element={<ProgressTracker />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;