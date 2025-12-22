import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from '../../components/Layout';
import api from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CEODashboard = () => {
  const [data, setData] = useState({ stats: {}, departmentStats: [], recentSurveys: [] });
  const [templateCount, setTemplateCount] = useState(0);

  useEffect(() => {
    api.get('/ceo/dashboard').then(res => setData(res.data));
    api.get('/ceo/surveys/templates').then(res => setTemplateCount(res.data.length));
  }, []);

  const barData = {
    labels: data.departmentStats.map(d => d.name),
    datasets: [{
      label: 'Completion Rate %',
      data: data.departmentStats.map(d => d.rate),
      backgroundColor: data.departmentStats.map(d => d.rate >= 80 ? '#22c55e' : d.rate >= 50 ? '#eab308' : '#ef4444')
    }]
  };

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [data.stats.completionRate || 0, 100 - (data.stats.completionRate || 0)],
      backgroundColor: ['#22c55e', '#e5e7eb']
    }]
  };

  return (
    <Layout title="CEO Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-3xl font-bold text-indigo-600">{data.stats.totalEmployees || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Departments</p>
          <p className="text-3xl font-bold text-blue-600">{data.stats.totalDepartments || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Available Templates</p>
          <p className="text-3xl font-bold text-teal-600">{templateCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">My Surveys</p>
          <p className="text-3xl font-bold text-purple-600">{data.stats.totalSurveys || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Overall Completion</p>
          <p className="text-3xl font-bold text-green-600">{data.stats.completionRate || 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Department Completion Rates</h2>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
          <div className="w-64 mx-auto">
            <Doughnut data={doughnutData} options={{ responsive: true }} />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Surveys</h2>
        <div className="space-y-3">
          {data.recentSurveys?.map(survey => (
            <div key={survey._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{survey.title}</span>
              <span className={`px-2 py-1 text-xs rounded ${survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {survey.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CEODashboard;
