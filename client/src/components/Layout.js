import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const Layout = ({ children, title, showBack = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/organizations', label: 'Organizations' },
      { to: '/admin/templates', label: 'Templates' }
    ],
    ceo: [
      { to: '/ceo', label: 'Dashboard' },
      { to: '/ceo/departments', label: 'Departments' },
      { to: '/ceo/employees', label: 'Employees' },
      { to: '/ceo/surveys', label: 'Surveys' },
      { to: '/help', label: 'Help' }
    ],
    user: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/help', label: 'Help' }
    ]
  };

  // Determine if we should show back button
  // For CEO: show on all pages except main dashboard
  // For others: show on detail pages only
  const ceoMainPage = '/ceo';
  const adminMainPages = ['/admin', '/admin/organizations', '/admin/templates'];
  const userMainPage = '/dashboard';
  
  let shouldShowBack = showBack;
  if (user?.role === 'ceo') {
    shouldShowBack = showBack || location.pathname !== ceoMainPage;
  } else if (user?.role === 'admin') {
    shouldShowBack = showBack || !adminMainPages.includes(location.pathname);
  } else {
    shouldShowBack = showBack || location.pathname !== userMainPage;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold">Survey App</span>
              {navLinks[user?.role]?.map(link => (
                <Link key={link.to} to={link.to} className="hover:text-indigo-200">{link.label}</Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.name} ({user?.role})</span>
              <button onClick={handleLogout} className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-800">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto py-6 px-4 w-full">
        {shouldShowBack && (
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        {title && <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
