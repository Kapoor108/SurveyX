import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
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
    <Layout title="Surveys">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('surveys')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'surveys' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          My Surveys ({surveys.length})
        </button>
        <button onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'templates' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          Available Templates ({templates.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              These survey templates are created by the admin. Click "Use Template" to create a survey for your organization.
            </p>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No survey templates available yet. Please contact admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{template.title}</h3>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Template</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{template.questions?.length || 0} questions</p>
                  
                  {/* Preview questions */}
                  <div className="space-y-1 mb-4 max-h-24 overflow-y-auto">
                    {template.questions?.slice(0, 3).map((q, i) => (
                      <div key={i} className="text-xs bg-gray-50 p-2 rounded truncate">
                        {q.questionNumber || i + 1}. {q.question}
                      </div>
                    ))}
                    {template.questions?.length > 3 && (
                      <p className="text-xs text-gray-400">+{template.questions.length - 3} more</p>
                    )}
                  </div>
                  
                  <button onClick={() => openTemplateModal(template)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
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
          <div className="flex justify-end mb-4">
            <button onClick={handleSyncAssignments} disabled={syncing}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm flex items-center gap-2">
              {syncing ? (
                <>
                  <span className="animate-spin">⟳</span> Syncing...
                </>
              ) : (
                <>
                  ⟳ Sync Assignments
                </>
              )}
            </button>
          </div>
          
          {surveys.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No surveys created yet.</p>
              <button onClick={() => setActiveTab('templates')} className="text-indigo-600 hover:text-indigo-800">
                Browse available templates →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surveys.map(survey => (
                <div key={survey._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{survey.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        survey.status === 'active' ? 'bg-green-100 text-green-800' : 
                        survey.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                      }`}>
                        {survey.status}
                      </span>
                      <button onClick={() => handleDelete(survey._id)} 
                        className="text-red-500 hover:text-red-700 text-lg" title="Delete Survey">
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                  <p className="text-sm text-gray-500 mb-2">{survey.questions?.length || 0} questions</p>
                  {survey.dueDate && (
                    <p className="text-xs text-gray-400 mb-2">Due: {new Date(survey.dueDate).toLocaleDateString()}</p>
                  )}
                  
                  {/* Assigned Departments */}
                  {survey.assignedDepartments?.length > 0 ? (
                    <div className="mb-3 p-2 bg-blue-50 rounded">
                      <p className="text-xs font-medium text-blue-700 mb-1">Assigned to:</p>
                      <div className="flex flex-wrap gap-1">
                        {survey.assignedDepartments.map(dept => (
                          <span key={dept._id} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {dept.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {survey.completedCount || 0}/{survey.totalAssigned || 0} completed
                      </p>
                    </div>
                  ) : survey.totalAssigned > 0 ? (
                    <div className="mb-3 p-2 bg-blue-50 rounded">
                      <p className="text-xs font-medium text-blue-700 mb-1">Assigned</p>
                      <p className="text-xs text-blue-600">
                        {survey.completedCount || 0}/{survey.totalAssigned || 0} completed
                      </p>
                    </div>
                  ) : null}
                  
                  <div className="flex gap-2">
                    {survey.status === 'draft' && (
                      <button onClick={() => { setSelectedSurvey(survey); setShowAssignModal(true); }}
                        className="flex-1 text-sm bg-indigo-100 text-indigo-700 px-3 py-2 rounded hover:bg-indigo-200">
                        Assign to Departments
                      </button>
                    )}
                    {survey.status === 'active' && (
                      <Link to={`/ceo/surveys/${survey._id}/analytics`}
                        className="flex-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-center">
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
    </Layout>
  );
};

export default CEOSurveys;
