import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import GigsPage from './pages/GigsPage';
import JobsPage from './pages/JobsPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/gigs" element={<GigsPage />} />
            <Route path="/gigs/:id" element={<GigsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobsPage />} />
            <Route path="/talent" element={<JobsPage />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)', gap: 16 }}>
                <div style={{ fontSize: 72 }}>🔍</div>
                <h2 style={{ fontSize: 28, fontWeight: 800 }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p>
                <a href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back to Home</a>
              </div>
            } />
          </Routes>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
