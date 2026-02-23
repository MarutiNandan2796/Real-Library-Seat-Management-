import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import SuperAdminSetup from './pages/SuperAdminSetup';
import AdminPanel from './pages/AdminPanel';
import UserPanel from './pages/UserPanel';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('appTheme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);

    // Apply theme to document
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'auto') => {
    const htmlElement = document.documentElement;
    
    if (selectedTheme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlElement.classList.toggle('dark', isDark);
    } else {
      htmlElement.classList.toggle('dark', selectedTheme === 'dark');
    }

    localStorage.setItem('appTheme', selectedTheme);
  };

  // Expose theme functions globally for use in other components
  useEffect(() => {
    (window as any).setAppTheme = (selectedTheme: 'light' | 'dark' | 'auto') => {
      setTheme(selectedTheme);
      applyTheme(selectedTheme);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/super-admin-setup" element={<SuperAdminSetup />} />
          
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/user/*"
            element={
              <ProtectedRoute requiredRole="user">
                <UserPanel />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function App() {
  return <AppContent />;
}

export default App;
