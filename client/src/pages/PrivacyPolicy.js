import React from 'react';
import SimplePage from '../components/SimplePage';

const PrivacyPolicy = () => {
  return (
    <SimplePage title="Privacy Policy">
      <p className="text-sm text-gray-500 mb-8">Last updated: December 23, 2025</p>
      
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
      <p className="text-gray-700 mb-4">
        We collect information you provide directly to us, including name, email address, company information, and survey responses. We also collect usage data and analytics to improve our service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
      <p className="text-gray-700 mb-4">
        We use the information we collect to:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Provide, maintain, and improve our services</li>
        <li>Process and complete transactions</li>
        <li>Send you technical notices and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Analyze usage patterns and trends</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
      <p className="text-gray-700 mb-4">
        We do not sell your personal information. We may share your information with service providers who assist us in operating our platform, conducting our business, or serving our users.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
      <p className="text-gray-700 mb-4">
        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
      <p className="text-gray-700 mb-4">
        You have the right to access, update, or delete your personal information. You can also object to processing, request data portability, and withdraw consent at any time.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies</h2>
      <p className="text-gray-700 mb-4">
        We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Contact Us</h2>
      <p className="text-gray-700 mb-4">
        If you have any questions about this Privacy Policy, please contact us at:
      </p>
      <p className="text-gray-700">
        Email: privacy@surveypulse.com<br/>
        Address: 123 Innovation Drive, San Francisco, CA 94105
      </p>
    </SimplePage>
  );
};

export default PrivacyPolicy;
