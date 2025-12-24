import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const SimplePage = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SurveyPulse
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Back to Home</Link>
              <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="prose prose-lg max-w-none">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SimplePage;
