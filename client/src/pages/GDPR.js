import React from 'react';
import SimplePage from '../components/SimplePage';

const GDPR = () => {
  return (
    <SimplePage title="GDPR Compliance">
      <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2025</p>
      
      <p className="text-gray-700 mb-4">
        SurveyPulse is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR).
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Rights Under GDPR</h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
        <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
        <li><strong>Right to Erasure:</strong> You can request deletion of your data</li>
        <li><strong>Right to Restrict Processing:</strong> You can limit how we use your data</li>
        <li><strong>Right to Data Portability:</strong> You can receive your data in a structured format</li>
        <li><strong>Right to Object:</strong> You can object to certain types of processing</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Protection</h2>
      <p className="text-gray-700 mb-4">
        We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption, access controls, and regular security assessments.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Data Processing</h2>
      <p className="text-gray-700 mb-4">
        We process personal data only for specified, explicit, and legitimate purposes. We ensure data is adequate, relevant, and limited to what is necessary.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Exercise Your Rights</h2>
      <p className="text-gray-700 mb-4">
        To exercise any of your GDPR rights, please contact our Data Protection Officer at:
      </p>
      <p className="text-gray-700">
        Email: dpo@surveypulse.com<br/>
        We will respond to your request within 30 days.
      </p>
    </SimplePage>
  );
};

export default GDPR;
