
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BloodInventory from './components/Request';
import Registry from './components/OrganRegistry';
import MatchPage from './components/MatchPage';
import Integration from './components/Integration';
import LoginForm from './components/Login'; // Make sure LoginForm is exported separately
// OR if `LoginPage` contains router logic, extract it

// Protected Route logic
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blood-inventory"
          element={
            <ProtectedRoute>
              <BloodInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organ-registry"
          element={
            <ProtectedRoute>
              <Registry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match-requests"
          element={
            <ProtectedRoute>
              <MatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/integration-hub"
          element={
            <ProtectedRoute>
              <Integration />
            </ProtectedRoute>
          }
        />
        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;