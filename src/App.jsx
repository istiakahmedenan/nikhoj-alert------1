import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminLogin } from './pages/AdminLogin.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { PublicHome } from './pages/PublicHome.jsx';

export default function App() {
  // Detect if user visits via custom admin domain (e.g. admin.nikhojalert.online)
  const isAdminDomain = useMemo(() => {
    const host = window.location.hostname.toLowerCase();
    return host === 'admin.nikhojalert.online' || host.startsWith('admin.');
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Home Route: If on admin domain redirect to /admin, otherwise show Public Feed */}
          <Route
            path="/"
            element={isAdminDomain ? <Navigate to="/admin" replace /> : <PublicHome />}
          />

          {/* Admin Login Route */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all wildcard fallback */}
          <Route
            path="*"
            element={<Navigate to={isAdminDomain ? '/admin' : '/'} replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
