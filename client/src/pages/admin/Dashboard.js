import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: {}, recentActivity: [] });

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setData(res.data));
  }, []);

  const StatCard = ({ label, value, color }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  return (
    <Layout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        <StatCard label="Organizations" value={data.stats.totalOrgs || 0} color="border-blue-500" />
        <StatCard label="Active Orgs" value={data.stats.activeOrgs || 0} color="border-green-500" />
        <StatCard label="Employees" value={data.stats.totalEmployees || 0} color="border-purple-500" />
        <StatCard label="Templates" value={data.stats.totalTemplates || 0} color="border-teal-500" />
        <StatCard label="Surveys" value={data.stats.totalSurveys || 0} color="border-yellow-500" />
        <StatCard label="Pending Invites" value={data.stats.pendingInvites || 0} color="border-orange-500" />
        <StatCard label="Responses" value={data.stats.totalResponses || 0} color="border-indigo-500" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {data.recentActivity?.map((activity, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>{activity.employeeId?.name} submitted {activity.surveyId?.title}</span>
              <span className="text-sm text-gray-500">{new Date(activity.submittedAt).toLocaleString()}</span>
            </div>
          ))}
          {!data.recentActivity?.length && <p className="text-gray-500">No recent activity</p>}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
