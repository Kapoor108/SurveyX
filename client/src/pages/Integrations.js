import React from 'react';
import SimplePage from '../components/SimplePage';

const Integrations = () => {
  const integrations = [
    { name: 'Slack', description: 'Get survey notifications in Slack', icon: '💬' },
    { name: 'Microsoft Teams', description: 'Integrate with Teams channels', icon: '👥' },
    { name: 'Google Workspace', description: 'Sync with Google Calendar and Drive', icon: '📧' },
    { name: 'Salesforce', description: 'Connect with your CRM data', icon: '☁️' },
    { name: 'Zapier', description: 'Connect with 3000+ apps', icon: '⚡' },
    { name: 'API', description: 'Build custom integrations', icon: '🔌' },
  ];

  return (
    <SimplePage title="Integrations">
      <p className="text-xl text-gray-600 mb-8">
        Connect SurveyPulse with your favorite tools and streamline your workflow.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {integrations.map((integration, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{integration.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
            <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700">
              Learn More →
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Integration?</h2>
        <p className="text-gray-700 mb-4">
          Our API makes it easy to build custom integrations tailored to your needs. Check out our API documentation or contact our team for assistance.
        </p>
        <div className="flex gap-4">
          <a href="/api" className="text-indigo-600 font-medium hover:text-indigo-700">
            View API Docs →
          </a>
          <a href="/contact" className="text-indigo-600 font-medium hover:text-indigo-700">
            Contact Us →
          </a>
        </div>
      </div>
    </SimplePage>
  );
};

export default Integrations;
