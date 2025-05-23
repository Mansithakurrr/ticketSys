import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketsProvider } from './context/TicketsContext';
import { AuditTrailProvider } from './context/AuditTrailContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// User Pages
import DashboardPage from './pages/user/DashboardPage';
import TicketsPage from './pages/user/TicketsPage';
import TicketDetailPage from './pages/user/TicketDetailPage';
import SubmitTicketPage from './pages/user/SubmitTicketPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminKanbanPage from './pages/admin/AdminKanbanPage';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuditTrailProvider>
          <TicketsProvider>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>
              
              {/* User Routes */}
              <Route element={<MainLayout />}>
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
                  <Route path="/submit" element={<SubmitTicketPage />} />
                </Route>
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="tickets" element={<AdminTicketsPage />} />
                <Route path="kanban" element={<AdminKanbanPage />} />
              </Route>
            </Routes>
          </TicketsProvider>
        </AuditTrailProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;