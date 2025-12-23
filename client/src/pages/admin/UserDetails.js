import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        alert('Failed to load user details');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:text-indigo-800">Go Back</button>
        </div>
      </AdminLayout>
    );
  }

  const { user, surveyResults, summary } = data;

  return (
    <AdminLayout title="User Details">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">{user.role}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{user.orgId?.name || 'No Org'}</span>
              {user.departmentId && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">{user.departmentId.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-600">Surveys Completed</p>
          <p className="text-3xl font-bold text-gray-800">{summary.totalSurveys}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-indigo-600">Total Creativity</p>
          <p className="text-3xl font-bold text-indigo-700">{summary.totalCreativityMarks}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-green-600">Total Morality</p>
          <p className="text-3xl font-bold text-green-700">{summary.totalMoralityMarks}</p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-purple-600">Total Marks</p>
          <p className="text-3xl font-bold text-purple-700">{summary.totalMarks}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4 text-center">
          <p className="text-sm text-orange-600">Avg per Survey</p>
          <p className="text-3xl font-bold text-orange-700">
            {summary.totalSurveys > 0 ? Math.round(summary.totalMarks / summary.totalSurveys) : 0}
          </p>
        </div>
      </div>

      {/* Survey Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Survey Results</h3>
          <p className="text-sm text-gray-500">Click on a survey to see detailed breakdown</p>
        </div>

        {surveyResults.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No survey responses yet
          </div>
        ) : (
          <div className="divide-y">
            {surveyResults.map((result) => (
              <div key={result.id} className="p-4 hover:bg-gray-50">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setSelectedSurvey(selectedSurvey?.id === result.id ? null : result)}
                >
                  <div>
                    <h4 className="font-medium">{result.survey?.title || 'Unknown Survey'}</h4>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(result.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Creativity</p>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                        {result.creativityMarks}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Morality</p>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                        {result.moralityMarks}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-bold">
                        {result.totalMarks}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${selectedSurvey?.id === result.id ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedSurvey?.id === result.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium text-sm text-gray-700 mb-3">Question-wise Breakdown</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.answers?.map((ans, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">
                              Q{ans.questionNumber || i + 1}
                            </span>
                            <div className="flex gap-2">
                              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                C: {ans.creativityMarks || 0}
                              </span>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                M: {ans.moralityMarks || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Survey Questions with Marks */}
                    {result.survey?.questions && (
                      <div className="mt-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-3">Survey Questions</h5>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {result.survey.questions.map((q, i) => {
                            const answer = result.answers?.find(a => a.questionNumber === q.questionNumber);
                            return (
                              <div key={i} className="bg-white border rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-medium">
                                    {q.questionNumber || i + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{q.question}</p>
                                    {answer && (
                                      <div className="mt-2 flex gap-4 text-xs">
                                        <span className="text-indigo-600">Creativity: {answer.creativityMarks || 0} pts</span>
                                        <span className="text-green-600">Morality: {answer.moralityMarks || 0} pts</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetails;
