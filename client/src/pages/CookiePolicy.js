import React from 'react';
import SimplePage from '../components/SimplePage';

const CookiePolicy = () => {
  return (
    <SimplePage title="Cookie Policy">
      <p className="text-sm text-gray-500 mb-8">Last updated: December 23, 2025</p>
      
      <p className="text-gray-700 mb-4">
        This Cookie Policy explains how SurveyPulse uses cookies and similar technologies to recognize you when you visit our platform.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What are cookies?</h2>
      <p className="text-gray-700 mb-4">
        Cookies are small data files placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work more efficiently and provide information to website owners.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How we use cookies</h2>
      <p className="text-gray-700 mb-4">We use cookies for:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Authentication - to remember your login state</li>
        <li>Preferences - to remember your settings and preferences</li>
        <li>Analytics - to understand how you use our service</li>
        <li>Security - to protect against fraud and abuse</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Managing cookies</h2>
      <p className="text-gray-700 mb-4">
        Most web browsers allow you to control cookies through their settings. However, limiting cookies may impact your experience on our platform.
      </p>

      <p className="text-gray-700 mt-8">
        For questions about our use of cookies, contact us at privacy@surveypulse.com
      </p>
    </SimplePage>
  );
};

export default CookiePolicy;
