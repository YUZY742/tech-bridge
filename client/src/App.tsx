import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CircleList from './pages/CircleList';
import CircleDetail from './pages/CircleDetail';
import CompanyDashboard from './pages/CompanyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/circles" element={<CircleList />} />
              <Route path="/circles/:id" element={<CircleDetail />} />
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
