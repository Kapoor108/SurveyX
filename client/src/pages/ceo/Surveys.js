import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CEOLayout from '../../components/CEOLayout';
import api from '../../utils/api';

const CEOSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [activeTab, setActiveTab] = useState('surveys');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [surveyRes, templateRes, deptRes] = await Promise.all([
        api.get('/ceo/surveys'),
        api.get('/ceo/surveys/templates'),
        api.get('/ceo/departments')
      ]);
      setSurveys(surveyRes.data);
      setTemplates(templateRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleSyncAssignments = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/ceo/surveys/sync-assignments');
      alert(res.data.message);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to sync assignments');
    }
    setSyncing(false);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      // Create survey from template
      const res = await api.post('/ceo/surveys/from-template', { 
        templateId: selectedTemplate._id,
        dueDate: dueDate || null
      });
      
      // If departments selected, assign immediately
      if (selectedDepts.length > 0) {
        await api.post(`/ceo/surveys/${res.data._id}/assign`, { departmentIds: selectedDepts });
      }
      
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      setDueDate('');
      setSelectedDepts([]);
      loadData();
      alert(selectedDepts.length > 0 ? 'Survey created and assigned!' : 'Survey created from template!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create survey');
    }
  };

  const handleAssign = async () => {
    if (selectedDepts.length === 0) return alert('Select at least one department');
    try {
      const res = await api.post(`/ceo/surveys/${selectedSurvey._id}/assign`, { departmentIds: selectedDepts });
      setShowAssignModal(false);
      setSelectedDepts([]);
      loadData();
      alert(`Survey assigned to ${res.data.assignments?.length || 0} employees!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign survey');
    }
  };

  const openTemplateModal = (template) => {
    setSelectedTemplate(template);
    setDueDate('');
    setSelectedDepts([]);
    setShowTemplateModal(true);
  };

  const handleDelete = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this survey? This will also delete all assignments and responses.')) return;
    try {
      await api.delete(`/ceo/surveys/${surveyId}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete survey');
    }
  };

  return (
    <CEOLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header with Tabs and Premium Button */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('surveys')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'surveys' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>My Surveys</span>
                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  {surveys.length}
                </span>
              </div>
            </button>
            <button onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'templates' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Templates</span>
                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                  {templates.length}
                </span>
              </div>
            </button>
          </div>
          
          {/* Premium Feature Button */}
          <Link to="/pricing" 
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>Custom Template</span>
          </Link>
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Survey Templates</h3>
                <p className="text-blue-800 text-sm">
                  These survey templates are created by the admin. Click "Use Template" to create a survey for your organization.
                </p>
              </div>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates available</h3>
              <p className="text-gray-500">Please contact your admin to create survey templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-semibold">Template</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold">{template.questions?.length || 0}</span> questions
                    </span>
                  </div>
                  
                  {/* Preview questions */}
                  <div className="space-y-2 mb-4 max-h-24 overflow-y-auto">
                    {template.questions?.slice(0, 3).map((q, i) => (
                      <div key={i} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="font-semibold text-gray-700">{q.questionNumber || i + 1}.</span> {q.question}
                      </div>
                    ))}
                    {template.questions?.length > 3 && (
                      <p className="text-xs text-gray-400 text-center">+{template.questions.length - 3} more questions</p>
                    )}
                  </div>
                  
                  <button onClick={() => openTemplateModal(template)}
                    className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Surveys Tab */}
      {activeTab === 'surveys' && (
        <div>
          {/* Sync Button */}
          <div className="flex justify-end mb-6">
            <button onClick={handleSyncAssignments} disabled={syncing}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm flex items-center gap-2 font-medium shadow-sm transition-all">
              <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? 'Syncing...' : 'Sync Assignments'}
            </button>
          </div>
          
          {surveys.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No surveys created yet</h3>
              <p className="text-gray-500 mb-6">Get started by creating a survey from available templates</p>
              <button onClick={() => setActiveTab('templates')} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Browse Templates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveys.map(survey => (
                <div key={survey._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{survey.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        survey.status === 'active' ? 'bg-green-100 text-green-700' : 
                        survey.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {survey.status}
                      </span>
                      <button onClick={() => handleDelete(survey._id)} 
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors" title="Delete Survey">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">{survey.questions?.length || 0}</span> questions
                    </div>
                    {survey.dueDate && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due: {new Date(survey.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Assigned Departments */}
                  {survey.assignedDepartments?.length > 0 ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-2">Assigned to:</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {survey.assignedDepartments.map(dept => (
                          <span key={dept._id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                            {dept.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${survey.totalAssigned > 0 ? (survey.completedCount / survey.totalAssigned * 100) : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-blue-700">
                          {survey.completedCount || 0}/{survey.totalAssigned || 0}
                        </span>
                      </div>
                    </div>
                  ) : survey.totalAssigned > 0 ? (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-2">Assigned</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${survey.totalAssigned > 0 ? (survey.completedCount / survey.totalAssigned * 100) : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-blue-700">
                          {survey.completedCount || 0}/{survey.totalAssigned || 0}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="flex gap-2">
                    {survey.status === 'draft' && (
                      <button onClick={() => { setSelectedSurvey(survey); setShowAssignModal(true); }}
                        className="flex-1 text-sm bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors font-semibold">
                        Assign to Departments
                      </button>
                    )}
                    {survey.status === 'active' && (
                      <Link to={`/ceo/surveys/${survey._id}/analytics`}
                        className="flex-1 text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center font-semibold">
                        View Analytics
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Use Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Create Survey from Template</h2>
            <p className="text-gray-600 mb-4">Template: <span className="font-medium">{selectedTemplate.title}</span></p>
            
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="text-sm text-gray-600 mb-2">{selectedTemplate.description}</p>
              <p className="text-sm"><span className="text-gray-500">Questions:</span> {selectedTemplate.questions?.length || 0}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            
            {/* Department Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Departments (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">Select departments to assign immediately, or skip to assign later.</p>
              {departments.length === 0 ? (
                <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded">No departments created yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {departments.map(dept => (
                    <label key={dept._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={selectedDepts.includes(dept._id)}
                        onChange={e => setSelectedDepts(e.target.checked ? [...selectedDepts, dept._id] : selectedDepts.filter(id => id !== dept._id))}
                        className="rounded text-indigo-600" />
                      <span className="text-sm">{dept.name}</span>
                      <span className="text-xs text-gray-400">({dept.employeeCount || 0} employees)</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); setSelectedDepts([]); }} 
                className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button onClick={handleUseTemplate} 
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                {selectedDepts.length > 0 ? 'Create & Assign' : 'Create Survey'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-semibold mb-2">Assign Survey</h2>
            <p className="text-gray-600 mb-4">{selectedSurvey.title}</p>
            <p className="text-sm text-gray-500 mb-4">Select departments to assign this survey to:</p>
            
            {departments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No departments created yet. Create departments first.</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {departments.map(dept => (
                  <label key={dept._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedDepts.includes(dept._id)}
                      onChange={e => setSelectedDepts(e.target.checked ? [...selectedDepts, dept._id] : selectedDepts.filter(id => id !== dept._id))}
                      className="rounded text-indigo-600" />
                    <span>{dept.name}</span>
                    <span className="text-xs text-gray-400">({dept.employeeCount || 0} employees)</span>
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button onClick={() => { setShowAssignModal(false); setSelectedDepts([]); }} 
                className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssign} disabled={departments.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                Assign Survey
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </CEOLayout>
  );
};

export default CEOSurveys;
