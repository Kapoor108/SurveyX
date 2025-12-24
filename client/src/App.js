import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AIChatbot from './components/AIChatbot';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import Help from './pages/Help';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrganizations from './pages/admin/Organizations';
import AdminOrgDetails from './pages/admin/OrgDetails';
import AdminTemplates from './pages/admin/Templates';
import AdminUserDetails from './pages/admin/UserDetails';
import AdminReports from './pages/admin/Reports';
import AdminSupportTickets from './pages/admin/SupportTickets';
import SurveyReport from './pages/admin/SurveyReport';
import CEODashboard from './pages/ceo/Dashboard';
import CEODepartments from './pages/ceo/Departments';
import CEOEmployees from './pages/ceo/Employees';
import CEOSurveys from './pages/ceo/Surveys';
import CEOSurveyAnalytics from './pages/ceo/SurveyAnalytics';
import UserDashboard from './pages/user/Dashboard';
import UserSurvey from './pages/user/Survey';
// Footer Pages
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Integrations from './pages/Integrations';
import API from './pages/API';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import GDPR from './pages/GDPR';

// Protected Route with Role-Based Access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'ceo' ? '/ceo' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

// Redirect authenticated users away from login/signup
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'ceo' ? '/ceo' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Admin Routes - Only admin can access */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/organizations" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrganizations />
            </ProtectedRoute>
          } />
          <Route path="/admin/organizations/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrgDetails />
            </ProtectedRoute>
          } />
          <Route path="/admin/templates" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTemplates />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:userId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserDetails />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/:orgId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/:orgId/survey/:surveyId" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SurveyReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/support" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSupportTickets />
            </ProtectedRoute>
          } />
          
          {/* CEO Routes - Only CEO can access */}
          <Route path="/ceo" element={
            <ProtectedRoute allowedRoles={['ceo']}>
              <CEODashboard />
            </ProtectedRoute>
          } />
          <Route path="/ceo/departments" element={
            <ProtectedRoute allowedRoles={['ceo']}>
              <CEODepartments />
            </ProtectedRoute>
          } />
          <Route path="/ceo/employees" element={
            <ProtectedRoute allowedRoles={['ceo']}>
              <CEOEmployees />
            </ProtectedRoute>
          } />
          <Route path="/ceo/surveys" element={
            <ProtectedRoute allowedRoles={['ceo']}>
              <CEOSurveys />
            </ProtectedRoute>
          } />
          <Route path="/ceo/surveys/:id/analytics" element={
            <ProtectedRoute allowedRoles={['ceo']}>
              <CEOSurveyAnalytics />
            </ProtectedRoute>
          } />
          
          {/* User Routes - Only regular users can access */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/survey/:id" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserSurvey />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute allowedRoles={['user', 'ceo']}>
              <Help />
            </ProtectedRoute>
          } />
          
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/api" element={<API />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/gdpr" element={<GDPR />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global AI Chatbot - Available on all pages */}
        <AIChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
