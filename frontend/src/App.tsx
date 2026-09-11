import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { EligibilityChecker } from './pages/EligibilityChecker';
import { LoginPage } from './pages/LoginPage';
import { RegisterOTR } from './pages/RegisterOTR';
import { StudentDashboard } from './pages/StudentDashboard';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { ApplicationWizard } from './pages/ApplicationWizard';
import { GrievancePage } from './pages/GrievancePage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/schemes" element={<SchemesPage />} />
      <Route path="/schemes/:id" element={<SchemeDetailPage />} />
      <Route path="/eligibility" element={<EligibilityChecker />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterOTR />} />
      <Route path="/otr" element={<RegisterOTR />} />
      
      {/* Protected Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/applications"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/documents"
        element={
          <ProtectedRoute requiredRole="student">
            <DocumentVaultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/announcements"
        element={<AnnouncementsPage />}
      />
      <Route
        path="/apply"
        element={
          <ProtectedRoute requiredRole="student">
            <ApplicationWizard />
          </ProtectedRoute>
        }
      />

      {/* Public / Common Routes */}
      <Route path="/grievance" element={<GrievancePage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grievances"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
