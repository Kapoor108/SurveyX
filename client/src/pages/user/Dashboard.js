import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const UserDashboard = () => {
  const [data, setData] = useState({ pending: [], completed: [], stats: {} });

  useEffect(() => {
    api.get('/user/dashboard').then(res => setData(res.data));
  }, []);

  const getDaysLeftColor = (days) => {
    if (days === null) return 'text-gray-500';
    if (days <= 1) return 'text-red-600';
    if (days <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Layout title="My Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Assigned</p>
          <p className="text-3xl font-bold">{data.stats.totalAssigned}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{data.stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{data.stats.pending}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Your Progress</span>
          <span className="text-sm text-gray-600">{data.stats.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-indigo-600 h-4 rounded-full transition-all" style={{ width: `${data.stats.completionRate}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Surveys */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Surveys</h2>
          {data.pending.length === 0 ? (
            <p className="text-gray-500">No pending surveys! 🎉</p>
          ) : (
            <div className="space-y-3">
              {data.pending.map(item => (
                <div key={item.assignmentId} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{item.survey.title}</h3>
                      <p className="text-sm text-gray-500">{item.survey.questions?.length || 0} questions</p>
                      {item.survey.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.survey.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {item.status === 'in_progress' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">In Progress</span>
                      )}
                      {item.daysLeft !== null && (
                        <p className={`text-sm mt-1 ${getDaysLeftColor(item.daysLeft)}`}>
                          {item.daysLeft <= 0 ? 'Overdue!' : `${item.daysLeft} days left`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link to={`/survey/${item.survey._id}`}
                    className="inline-block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    {item.status === 'in_progress' ? 'Continue Survey' : 'Attempt Survey'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Surveys */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Completed Surveys</h2>
          {data.completed.length === 0 ? (
            <p className="text-gray-500">No completed surveys yet</p>
          ) : (
            <div className="space-y-3">
              {data.completed.map(item => (
                <div key={item.assignmentId} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.survey.title}</h3>
                      <p className="text-sm text-gray-500">Completed: {new Date(item.completedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
