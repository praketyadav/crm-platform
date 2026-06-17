// Author: Ajar | Module: App | CRM Platform v1.0

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import Pipeline from './pages/Pipeline.jsx';
import FollowUps from './pages/FollowUps.jsx';
import EmailCampaigns from './pages/EmailCampaigns.jsx';
import Analytics from './pages/Analytics.jsx';
import AIAssistantPage from './pages/AIAssistant.jsx';
import TeamManagement from './pages/TeamManagement.jsx';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#22222F',
            color: '#F1F1F5',
            border: '1px solid #2A2A3E',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="email-campaigns" element={
            <ProtectedRoute roles={['ADMIN', 'SALES_MANAGER']}><EmailCampaigns /></ProtectedRoute>
          } />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="team" element={
            <ProtectedRoute roles={['ADMIN']}><TeamManagement /></ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
