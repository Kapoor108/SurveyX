import React from 'react';
import SimplePage from '../components/SimplePage';

const Careers = () => {
  const positions = [
    { title: 'Senior Frontend Developer', department: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', type: 'Full-time' },
    { title: 'Customer Success Manager', department: 'Customer Success', location: 'Remote', type: 'Full-time' },
    { title: 'Marketing Specialist', department: 'Marketing', location: 'New York, NY', type: 'Full-time' },
  ];

  return (
    <SimplePage title="Careers at SurveyPulse">
      <p className="text-xl text-gray-600 mb-8">
        Join our team and help us build the future of employee feedback. We're always looking for talented, passionate people.
      </p>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Competitive salary and equity packages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Flexible remote work options</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Comprehensive health benefits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Professional development budget</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span>Collaborative and inclusive culture</span>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
      <div className="space-y-4">
        {positions.map((position, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{position.title}</h3>
              <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{position.type}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📍 {position.location}</span>
              <span>🏢 {position.department}</span>
            </div>
            <button className="mt-4 text-indigo-600 font-medium hover:text-indigo-700">
              Apply Now →
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 p-8 rounded-xl text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Don't see a perfect fit?</h3>
        <p className="text-gray-600 mb-4">We're always interested in hearing from talented people. Send us your resume!</p>
        <a href="mailto:careers@surveypulse.com" className="text-indigo-600 font-medium hover:text-indigo-700">
          careers@surveypulse.com
        </a>
      </div>
    </SimplePage>
  );
};

export default Careers;
