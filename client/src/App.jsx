import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import AdminDashboard from '@/pages/AdminDashboard';
import PublicViewer from '@/pages/PublicViewer';
import Contact from '@/pages/Contact';
import AboutUs from '@/pages/AboutUs';
import FurnitureShowcase from '@/pages/FurnitureShowcase';
import MyDesigns from '@/pages/MyDesigns';
import UserCreateRoom from '@/pages/UserCreateRoom';
import UserEditRoom from '@/pages/UserEditRoom';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { setAuth } = useAuthStore();

  // Initialize auth from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setAuth(userData, token);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [setAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/furniture" element={<FurnitureShowcase />} />
          <Route path="/viewer/:id" element={<PublicViewer />} />
          
          {/* Admin Routes - Only furniture management */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* User Routes - Room creation and management */}
          <Route 
            path="/my-designs" 
            element={
              <ProtectedRoute>
                <MyDesigns />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-room" 
            element={
              <ProtectedRoute>
                <UserCreateRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-room/:id" 
            element={
              <ProtectedRoute>
                <UserEditRoom />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
