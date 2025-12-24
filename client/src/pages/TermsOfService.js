import React from 'react';
import SimplePage from '../components/SimplePage';

const TermsOfService = () => {
  return (
    <SimplePage title="Terms of Service">
      <p className="text-sm text-gray-500 mb-8">Last updated: December 23, 2025</p>
      
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="text-gray-700 mb-4">
        By accessing and using SurveyPulse, you accept and agree to be bound by the terms and provision of this agreement.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h2>
      <p className="text-gray-700 mb-4">
        Permission is granted to temporarily access SurveyPulse for personal or commercial use. This is the grant of a license, not a transfer of title.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
      <p className="text-gray-700 mb-4">
        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Prohibited Uses</h2>
      <p className="text-gray-700 mb-4">
        You may not use our service for any illegal or unauthorized purpose. You must not transmit any worms, viruses, or any code of a destructive nature.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Service Modifications</h2>
      <p className="text-gray-700 mb-4">
        We reserve the right to modify or discontinue the service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
      <p className="text-gray-700 mb-4">
        In no event shall SurveyPulse be liable for any damages arising out of the use or inability to use our service.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Governing Law</h2>
      <p className="text-gray-700 mb-4">
        These terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact Information</h2>
      <p className="text-gray-700">
        For questions about these Terms, contact us at legal@surveypulse.com
      </p>
    </SimplePage>
  );
};

export default TermsOfService;
