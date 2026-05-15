import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isFirebaseConfigured } from './firebase';
import MissingFirebaseConfig from './components/MissingFirebaseConfig';
import PageLoader from './components/PageLoader';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Batches from './pages/Batches';
import ClassTracking from './pages/ClassTracking';
import Reports from './pages/Reports';
import Finance from './pages/Finance';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="লগইন যাচাই হচ্ছে…" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = useNavigate();
  const navigate = (path) => nav(path);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        navigate={navigate}
      />
      <div className="flex-1 overflow-auto mt-16 md:mt-0">
        {children}
      </div>
    </div>
  );
};

function App() {
  if (!import.meta.env.DEV && !isFirebaseConfigured()) {
    return <MissingFirebaseConfig />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Teachers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Students />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Batches />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/class-tracking"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ClassTracking />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Finance />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
