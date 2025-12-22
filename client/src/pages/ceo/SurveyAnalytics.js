import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from '../../components/Layout';
import api from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CEOSurveyAnalytics = () => {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState('all'); // all, completed, pending

  useEffect(() => {
    api.get(`/ceo/surveys/${id}/analytics`).then(res => setAnalytics(res.data));
  }, [id]);

  if (!analytics) return <Layout><div>Loading...</div></Layout>;

  const deptData = {
    labels: Object.keys(analytics.byDepartment),
    datasets: [{
      label: 'Completed',
      data: Object.values(analytics.byDepartment).map(d => d.completed),
      backgroundColor: '#22c55e'
    }, {
      label: 'Pending',
      data: Object.values(analytics.byDepartment).map(d => d.total - d.completed),
      backgroundColor: '#eab308'
    }]
  };

  // Filter employees based on status
  const filteredEmployees = analytics.employees?.filter(emp => {
    if (employeeFilter === 'all') return true;
    if (employeeFilter === 'completed') return emp.status === 'completed';
    return emp.status !== 'completed';
  }) || [];

  return (
    <Layout title="Survey Analytics">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Assigned</p>
          <p className="text-3xl font-bold">{analytics.totalAssigned}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{analytics.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{analytics.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-3xl font-bold text-indigo-600">{analytics.completionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By Department</h2>
          <Bar data={deptData} options={{ responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
          <div className="w-64 mx-auto">
            <Pie data={{
              labels: ['Completed', 'Pending'],
              datasets: [{ data: [analytics.completed, analytics.pending], backgroundColor: ['#22c55e', '#eab308'] }]
            }} />
          </div>
        </div>
      </div>

      {/* Employee Completion List */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Employee Responses</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setEmployeeFilter('all')}
              className={`px-3 py-1 rounded text-sm ${employeeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              All ({analytics.employees?.length || 0})
            </button>
            <button 
              onClick={() => setEmployeeFilter('completed')}
              className={`px-3 py-1 rounded text-sm ${employeeFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              Completed ({analytics.completed})
            </button>
            <button 
              onClick={() => setEmployeeFilter('pending')}
              className={`px-3 py-1 rounded text-sm ${employeeFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              Pending ({analytics.pending})
            </button>
          </div>
        </div>
        
        {filteredEmployees.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No employees found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{emp.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        emp.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : emp.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {emp.status === 'completed' ? 'Completed' : emp.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {emp.completedAt ? new Date(emp.completedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Question Analytics</h2>
        <div className="space-y-6">
          {analytics.questionAnalytics.map((q, i) => (
            <div key={i} className="border-b pb-4">
              <p className="font-medium mb-2">Q{i + 1}: {q.question}</p>
              <p className="text-sm text-gray-500 mb-2">Type: {q.type}</p>
              
              {q.type === 'rating' && (
                <div>
                  <p className="text-lg font-semibold text-indigo-600">Average: {q.average}/5</p>
                  <div className="flex gap-2 mt-2">
                    {q.distribution?.map((count, idx) => (
                      <div key={idx} className="text-center">
                        <div className="w-12 bg-gray-200 rounded" style={{ height: `${Math.max(count * 10, 4)}px` }}></div>
                        <span className="text-xs">{idx + 1}★ ({count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {q.type === 'mcq' && (
                <div className="space-y-1">
                  {q.distribution?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-32 text-sm truncate">{opt.option}</span>
                      <div className="flex-1 bg-gray-200 rounded h-4">
                        <div className="bg-indigo-500 h-4 rounded" style={{ width: `${(opt.count / analytics.completed) * 100 || 0}%` }}></div>
                      </div>
                      <span className="text-sm w-8">{opt.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CEOSurveyAnalytics;
