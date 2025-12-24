import React from 'react';
import SimplePage from '../components/SimplePage';

const API = () => {
  return (
    <SimplePage title="API Documentation">
      <p className="text-xl text-gray-600 mb-8">
        Build powerful integrations with the SurveyPulse API. RESTful, well-documented, and easy to use.
      </p>

      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-8 overflow-x-auto">
        <code className="text-sm">
          curl -X GET https://api.surveypulse.com/v1/surveys \<br/>
          &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
        </code>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Getting Started</h2>
      <p className="text-gray-700 mb-4">
        To use the SurveyPulse API, you'll need an API key. You can generate one from your account settings.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Available Endpoints</h2>
      <div className="space-y-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-gray-900">/v1/surveys</code>
          </div>
          <p className="text-gray-600 text-sm">List all surveys</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-mono">POST</span>
            <code className="text-gray-900">/v1/surveys</code>
          </div>
          <p className="text-gray-600 text-sm">Create a new survey</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-gray-900">/v1/surveys/:id/responses</code>
          </div>
          <p className="text-gray-600 text-sm">Get survey responses</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono">GET</span>
            <code className="text-gray-900">/v1/employees</code>
          </div>
          <p className="text-gray-600 text-sm">List all employees</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Rate Limits</h2>
      <p className="text-gray-700 mb-4">
        API requests are limited to 1000 requests per hour per API key. Contact us if you need higher limits.
      </p>

      <div className="bg-indigo-50 p-6 rounded-lg mt-8">
        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-700 mb-4">
          Our developer support team is here to help you integrate with SurveyPulse.
        </p>
        <a href="/contact" className="text-indigo-600 font-medium hover:text-indigo-700">
          Contact Developer Support →
        </a>
      </div>
    </SimplePage>
  );
};

export default API;
