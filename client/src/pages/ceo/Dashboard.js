import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import CEOLayout from '../../components/CEOLayout';
import api from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CEODashboard = () => {
  const [data, setData] = useState({ stats: {}, departmentStats: [], recentSurveys: [] });
  const [templateCount, setTemplateCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/ceo/dashboard'),
      api.get('/ceo/surveys/templates')
    ]).then(([dashRes, templateRes]) => {
      setData(dashRes.data);
      setTemplateCount(templateRes.data.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const barData = {
    labels: data.departmentStats.map(d => d.name),
    datasets: [{
      label: 'Completion Rate %',
      data: data.departmentStats.map(d => d.rate),
      backgroundColor: data.departmentStats.map(d => d.rate >= 80 ? '#22c55e' : d.rate >= 50 ? '#eab308' : '#ef4444'),
      borderRadius: 8
    }]
  };

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [data.stats.completionRate || 0, 100 - (data.stats.completionRate || 0)],
      backgroundColor: ['#22c55e', '#e5e7eb'],
      borderWidth: 0
    }]
  };

  const StatCard = ({ label, value, icon, gradient, link }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {link && (
        <Link to={link} className="text-xs text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          View Details
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <CEOLayout>
        <div className="p-8 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </CEOLayout>
    );
  }

  return (
    <CEOLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
              <p className="text-indigo-100">Monitor your organization's survey progress and employee engagement</p>
            </div>
            <div className="hidden lg:block">
              <svg className="w-32 h-32 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          label="Total Employees"
          value={data.stats.totalEmployees || 0}
          gradient="from-blue-500 to-blue-600"
          link="/ceo/employees"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Departments"
          value={data.stats.totalDepartments || 0}
          gradient="from-purple-500 to-purple-600"
          link="/ceo/departments"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Available Templates"
          value={templateCount}
          gradient="from-teal-500 to-teal-600"
          link="/ceo/surveys"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="My Surveys"
          value={data.stats.totalSurveys || 0}
          gradient="from-orange-500 to-orange-600"
          link="/ceo/surveys"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Overall Completion"
          value={`${data.stats.completionRate || 0}%`}
          gradient="from-green-500 to-green-600"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Department Completion Rates</h2>
          {data.departmentStats.length > 0 ? (
            <Bar data={barData} options={{ 
              responsive: true, 
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100 }
              }
            }} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="font-medium">No department data available</p>
              <p className="text-sm mt-1">Create departments and assign surveys to see analytics</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Overall Progress</h2>
          <div className="w-64 mx-auto">
            <Doughnut data={doughnutData} options={{ 
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }} />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Survey Completion Status</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.stats.completionRate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Recent Surveys */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Surveys</h2>
            <Link to="/ceo/surveys" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          {data.recentSurveys?.length > 0 ? (
            <div className="space-y-3">
              {data.recentSurveys.map(survey => (
                <div key={survey._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{survey.title}</p>
                      <p className="text-sm text-gray-500">{survey.questions?.length || 0} questions</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                    survey.status === 'active' ? 'bg-green-100 text-green-700' : 
                    survey.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {survey.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 font-medium">No surveys yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first survey to get started</p>
              <Link to="/ceo/surveys" className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Browse Templates
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </CEOLayout>
  );
};

export default CEODashboard;
