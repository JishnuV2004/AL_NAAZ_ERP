import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Route Guards
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import PublicRoute from './components/routes/PublicRoute';

// Pages
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Finance from './pages/Finance';
import Attendance from './pages/Attendance';
import Salary from './pages/Salary';
import Advance from './pages/Advance';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Layout wrapper for protected pages
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content page area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-10 md:px-12 transition-all duration-300 bg-white">
        <Navbar />
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* React Hot Toast global configuration */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FFFFFF',
            color: '#4E3629',
            border: '1px solid #E8DFD5',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 4px 12px rgba(46, 30, 18, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#C5A23C',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Routes>
        {/* Route Index Redirection */}
        <Route path="/" element={<Navigate to="/inventory" replace />} />

        {/* Public auth paths */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected app paths */}
        <Route element={<ProtectedRoute />}>
          <Route path="/inventory/*" element={<Layout><Inventory /></Layout>} />
          <Route path="/finance/*" element={<Layout><Finance /></Layout>} />
          <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
          <Route path="/salary" element={<Layout><Salary /></Layout>} />
          <Route path="/advance" element={<Layout><Advance /></Layout>} />
          
          {/* Admin-only Notifications Route */}
          <Route element={<AdminRoute />}>
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
          </Route>
        </Route>

        {/* Wildcard 404 path */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
