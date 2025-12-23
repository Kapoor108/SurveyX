import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const AdminOrgDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [userMarks, setUserMarks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    api.get(`/admin/organizations/${id}`).then(res => setData(res.data));
    api.get(`/admin/organizations/${id}/user-marks`).then(res => setUserMarks(res.data));
  }, [id]);

  if (!data) return <AdminLayout><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title={data.org.name}>
      {/* Header with Reports Button */}
      <div className="flex items-center justify-between mb-6">
        <div></div>
        <button
          onClick={() => navigate(`/admin/reports/${id}`)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold">{data.stats.totalEmployees}</p>
          <p className="text-xs text-green-600">{data.stats.activeEmployees} active</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Departments</p>
          <p className="text-2xl font-bold">{data.departments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Surveys</p>
          <p className="text-2xl font-bold">{data.stats.totalSurveys}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Responses</p>
          <p className="text-2xl font-bold">{userMarks.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['overview', 'user-marks'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {tab === 'overview' ? 'Overview' : 'User Marks'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Departments</h2>
            <div className="space-y-2">
              {data.departments.map(dept => (
                <div key={dept._id} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>{dept.name}</span>
                  <span className="text-sm text-gray-500">{data.employees.filter(e => e.departmentId === dept._id).length} employees</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Employees</h2>
            <p className="text-sm text-gray-500 mb-4">Click on an employee to view their marks</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.employees.map(emp => (
                <div key={emp._id} 
                  onClick={() => navigate(`/admin/users/${emp._id}`)}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-indigo-50 transition-colors">
                  <div>
                    <p className="font-medium text-indigo-600 hover:text-indigo-800">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${emp.inviteStatus === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {emp.inviteStatus}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Surveys & Reports</h2>
            <div className="space-y-3">
              {data.surveys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No surveys created yet</p>
              ) : (
                data.surveys.map(survey => (
                  <div key={survey._id} className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{survey.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{survey.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-3 py-1 rounded-full ${
                            survey.status === 'active' ? 'bg-green-100 text-green-700' : 
                            survey.status === 'closed' ? 'bg-gray-100 text-gray-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {survey.status}
                          </span>
                          <span className="text-gray-500">
                            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {data.stats.totalAssignments} assigned
                          </span>
                          <span className="text-green-600">
                            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {data.stats.completedAssignments} completed
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/reports/${id}/survey/${survey._id}`)}
                        className="ml-4 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'user-marks' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Individual User Marks</h2>
            <p className="text-sm text-gray-500">View creativity and morality scores for each user</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Survey</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3 text-center">Creativity</th>
                  <th className="px-6 py-3 text-center">Morality</th>
                  <th className="px-6 py-3 text-center">Total</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {userMarks.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No responses yet</td></tr>
                ) : (
                  userMarks.map(mark => (
                    <tr key={mark.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div 
                          onClick={() => navigate(`/admin/users/${mark.employee?._id}`)}
                          className="cursor-pointer">
                          <p className="font-medium text-indigo-600 hover:text-indigo-800">{mark.employee?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{mark.employee?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{mark.survey?.title || 'N/A'}</td>
                      <td className="px-6 py-4">{mark.department?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                          {mark.totalCreativityMarks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          {mark.totalMoralityMarks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-bold">
                          {mark.totalMarks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(mark.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedResponse(mark)} 
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Details Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto py-8 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedResponse.employee?.name}'s Response</h2>
                <p className="text-gray-600">{selectedResponse.survey?.title}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <p className="text-sm text-indigo-600">Creativity</p>
                <p className="text-2xl font-bold text-indigo-700">{selectedResponse.totalCreativityMarks}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600">Morality</p>
                <p className="text-2xl font-bold text-green-700">{selectedResponse.totalMoralityMarks}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-700">{selectedResponse.totalMarks}</p>
              </div>
            </div>

            <h3 className="font-medium mb-3">Answer Breakdown</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedResponse.answers?.map((ans, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                  <span className="text-sm">Q{ans.questionNumber || i + 1}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-indigo-600">C: {ans.creativityMarks || 0}</span>
                    <span className="text-green-600">M: {ans.moralityMarks || 0}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedResponse(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrgDetails;
