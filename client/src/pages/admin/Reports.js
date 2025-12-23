import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const Reports = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [aspect, setAspect] = useState('present'); // 'present' or 'future'

  useEffect(() => {
    if (orgId) {
      loadReport();
    }
  }, [orgId]);

  const loadReport = async () => {
    try {
      const res = await api.get(`/reports/organizations/${orgId}`);
      setReport(res.data);
      if (res.data.surveyReports.length > 0) {
        setSelectedSurvey(res.data.surveyReports[0]);
      }
    } catch (error) {
      console.error('Load report error:', error);
      alert('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getQuadrantColor = (quadrant) => {
    const colors = {
      'Hope in Action (IGEN Zone)': 'bg-green-500',
      'Unbounded Power': 'bg-blue-500',
      'Safe Stagnation': 'bg-orange-500',
      'Extraction Engine': 'bg-red-500'
    };
    return colors[quadrant] || 'bg-gray-500';
  };

  const downloadReport = () => {
    if (!selectedSurvey) return;

    const aspectData = aspect === 'present' ? selectedSurvey.aggregateScores?.present : selectedSurvey.aggregateScores?.future;
    
    if (!aspectData) {
      alert('No data available for this aspect');
      return;
    }
    
    const reportData = {
      organization: report.organization.name,
      survey: selectedSurvey.survey.title,
      aspect: aspect === 'present' ? 'Present Scenario' : 'Future Scenario',
      generatedAt: new Date().toLocaleString(),
      aggregateScores: aspectData,
      responses: selectedSurvey.responses.map(r => ({
        employee: r.employee.name,
        department: r.employee.department,
        creativity_percentage: r.scores[aspect]?.creativity_percentage || 0,
        morality_percentage: r.scores[aspect]?.morality_percentage || 0,
        creativity_band: r.scores[aspect]?.creativity_band || 'N/A',
        morality_band: r.scores[aspect]?.morality_band || 'N/A',
        quadrant: r.scores[aspect]?.quadrant || 'N/A'
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.organization.name}_${selectedSurvey.survey.title}_${aspect}_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout title="Reports">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout title="Reports">
        <div className="text-center py-12">
          <p className="text-gray-500">Report not found</p>
          <button onClick={() => navigate('/admin/organizations')} className="mt-4 text-indigo-600 hover:text-indigo-800">
            Back to Organizations
          </button>
        </div>
      </AdminLayout>
    );
  }

  const aspectData = selectedSurvey && aspect === 'present' 
    ? selectedSurvey.aggregateScores?.present 
    : selectedSurvey?.aggregateScores?.future;

  // Safety check for aspectData
  const safeAspectData = aspectData || {
    avgCreativityPercentage: '0.0',
    avgMoralityPercentage: '0.0',
    avgCreativityTotal: '0.0',
    avgMoralityTotal: '0.0',
    quadrantDistribution: {}
  };

  return (
    <AdminLayout title={`Reports - ${report.organization.name}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{report.organization.name}</h2>
            <p className="text-indigo-100">Organization Report - {report.surveyReports.length} Surveys</p>
          </div>
          <button
            onClick={() => navigate(`/admin/organizations/${orgId}`)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Back to Organization
          </button>
        </div>
      </div>

      {/* Survey Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Survey</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.surveyReports.map(surveyReport => (
            <button
              key={surveyReport.survey.id}
              onClick={() => setSelectedSurvey(surveyReport)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedSurvey?.survey.id === surveyReport.survey.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-2">{surveyReport.survey.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{surveyReport.survey.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{surveyReport.totalResponses} responses</span>
                <span>{surveyReport.survey.questionCount} questions</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSurvey && selectedSurvey.totalResponses > 0 && (
        <>
          {/* Aspect Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setAspect('present')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    aspect === 'present'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Present Scenario
                </button>
                <button
                  onClick={() => setAspect('future')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    aspect === 'future'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Future Scenario
                </button>
              </div>
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Report
              </button>
            </div>
          </div>

          {/* Aggregate Scores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {aspect === 'present' ? 'Present Scenario' : 'Future Scenario'} - Aggregate Scores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <p className="text-sm text-blue-600 font-semibold mb-2">Avg Creativity</p>
                <p className="text-4xl font-bold text-blue-700">{safeAspectData.avgCreativityPercentage}%</p>
                <p className="text-xs text-blue-600 mt-2">Total: {safeAspectData.avgCreativityTotal}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <p className="text-sm text-green-600 font-semibold mb-2">Avg Morality</p>
                <p className="text-4xl font-bold text-green-700">{safeAspectData.avgMoralityPercentage}%</p>
                <p className="text-xs text-green-600 mt-2">Total: {safeAspectData.avgMoralityTotal}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <p className="text-sm text-purple-600 font-semibold mb-2">Creativity Band</p>
                <p className="text-2xl font-bold text-purple-700">
                  {getBand(parseFloat(safeAspectData.avgCreativityPercentage))}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                <p className="text-sm text-orange-600 font-semibold mb-2">Morality Band</p>
                <p className="text-2xl font-bold text-orange-700">
                  {getBand(parseFloat(safeAspectData.avgMoralityPercentage))}
                </p>
              </div>
            </div>
          </div>

          {/* AI & Humanity Matrix */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">AI & Humanity Matrix</h3>
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
                {/* Top Left - Safe Stagnation */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-lg font-bold">Safe Stagnation</h4>
                    </div>
                    <ul className="text-sm space-y-1 opacity-90">
                      <li>• Committee Caution</li>
                      <li>• Missed Opportunity</li>
                    </ul>
                  </div>
                  <p className="text-xs font-semibold">
                    {safeAspectData.quadrantDistribution['Safe Stagnation'] || 0} employees
                  </p>
                </div>

                {/* Top Right - Hope in Action */}
                <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h4 className="text-lg font-bold">Hope in Action</h4>
                    </div>
                    <p className="text-sm font-semibold mb-1">(IGEN Zone)</p>
                    <ul className="text-sm space-y-1 opacity-90">
                      <li>• Trusted Innovation</li>
                      <li>• Responsible Scale</li>
                    </ul>
                  </div>
                  <p className="text-xs font-semibold">
                    {safeAspectData.quadrantDistribution['Hope in Action (IGEN Zone)'] || 0} employees
                  </p>
                </div>

                {/* Bottom Left - Extraction Engine */}
                <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-lg p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-lg font-bold">Extraction Engine</h4>
                    </div>
                    <ul className="text-sm space-y-1 opacity-90">
                      <li>• Surveillance-First</li>
                      <li>• Exploitative Practices</li>
                    </ul>
                  </div>
                  <p className="text-xs font-semibold">
                    {safeAspectData.quadrantDistribution['Extraction Engine'] || 0} employees
                  </p>
                </div>

                {/* Bottom Right - Unbounded Power */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-lg font-bold">Unbounded Power</h4>
                    </div>
                    <ul className="text-sm space-y-1 opacity-90">
                      <li>• Autonomous Agents</li>
                      <li>• Unsafe Automation</li>
                    </ul>
                  </div>
                  <p className="text-xs font-semibold">
                    {safeAspectData.quadrantDistribution['Unbounded Power'] || 0} employees
                  </p>
                </div>
              </div>

              {/* Axis Labels */}
              <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90">
                <p className="text-sm font-bold text-gray-700">Creativity</p>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
                <p className="text-sm font-bold text-gray-700">Morality</p>
              </div>
              <div className="absolute -left-12 top-2">
                <p className="text-xs text-gray-500">High</p>
              </div>
              <div className="absolute -left-12 bottom-2">
                <p className="text-xs text-gray-500">Low</p>
              </div>
              <div className="absolute -bottom-6 left-2">
                <p className="text-xs text-gray-500">Low</p>
              </div>
              <div className="absolute -bottom-6 right-2">
                <p className="text-xs text-gray-500">High</p>
              </div>
            </div>

            {/* Moving to Top Right Guide */}
            <div className="mt-8 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-6 text-white">
              <h4 className="text-lg font-bold mb-4 text-center">Moving to the Top Right:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Set Moral Boundaries</p>
                    <p className="text-sm text-gray-300">do-not-automate list + accountability</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Design for Trust</p>
                    <p className="text-sm text-gray-300">Trust Contract + logging + escalation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Prove Value</p>
                    <p className="text-sm text-gray-300">Value Ledger + scale gates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Responses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Individual Employee Scores</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creativity %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Morality %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creativity Band</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Morality Band</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quadrant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedSurvey.responses.map((response, idx) => {
                    const scores = response.scores[aspect];
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{response.employee.name}</td>
                        <td className="px-6 py-4 text-gray-600">{response.employee.department}</td>
                        <td className="px-6 py-4">
                          <span className="text-blue-600 font-semibold">{scores.creativity_percentage}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 font-semibold">{scores.morality_percentage}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            scores.creativity_band === 'Leading' ? 'bg-green-100 text-green-700' :
                            scores.creativity_band === 'Emerging' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {scores.creativity_band}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            scores.morality_band === 'Leading' ? 'bg-green-100 text-green-700' :
                            scores.morality_band === 'Emerging' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {scores.morality_band}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getQuadrantColor(scores.quadrant)}`}>
                            {scores.quadrant}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedSurvey && selectedSurvey.totalResponses === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No responses yet for this survey</p>
          <p className="text-sm text-gray-400 mt-1">Reports will be available once employees submit their responses</p>
        </div>
      )}
    </AdminLayout>
  );
};

// Helper function for band calculation
const getBand = (percentage) => {
  if (percentage < 40) return 'Early';
  if (percentage < 50) return 'Emerging';
  return 'Leading';
};

export default Reports;
