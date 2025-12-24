import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import api from '../../utils/api';

const UserSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: { presentOption: idx, futureOption: idx } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/user/surveys/${id}`).then(res => {
      setSurvey(res.data.survey);
      if (res.data.draft) {
        const draftAnswers = {};
        res.data.draft.answers.forEach(a => {
          draftAnswers[a.questionId] = {
            presentOption: a.presentOptionIndex,
            futureOption: a.futureOptionIndex
          };
        });
        setAnswers(draftAnswers);
      }
    });
  }, [id]);

  const handleAnswer = (questionId, aspect, optionIndex, event) => {
    // Prevent any default behavior that might cause scrolling
    if (event) {
      event.preventDefault();
    }
    
    setAnswers({
      ...answers,
      [questionId]: {
        ...answers[questionId],
        [aspect]: optionIndex
      }
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, ans]) => ({
        questionId,
        presentOptionIndex: ans.presentOption,
        futureOptionIndex: ans.futureOption
      }));
      await api.post(`/user/surveys/${id}/draft`, { answers: formattedAnswers });
      alert('Draft saved!');
    } catch (err) {
      alert('Failed to save draft');
    }
    setSaving(false);
  };

  const handleSubmit = async () => {
    // Validate - each question needs both present and future selections
    const unanswered = survey.questions.filter(q => {
      const ans = answers[q._id];
      return q.required && (!ans || ans.presentOption === undefined || ans.futureOption === undefined);
    });
    
    if (unanswered.length > 0) {
      alert(`Please answer all required questions for both Present and Future aspects. Missing: ${unanswered.length} questions`);
      return;
    }

    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, ans]) => ({
        questionId,
        presentOptionIndex: ans.presentOption,
        futureOptionIndex: ans.futureOption
      }));
      await api.post(`/user/surveys/${id}/submit`, { answers: formattedAnswers });
      alert('Survey submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to submit survey');
    }
    setLoading(false);
  };

  if (!survey) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      </UserLayout>
    );
  }

  // Calculate progress - each question has 2 parts (present + future)
  const totalParts = survey.questions.length * 2;
  const answeredParts = Object.values(answers).reduce((acc, ans) => {
    return acc + 
      (ans.presentOption !== undefined ? 1 : 0) + 
      (ans.futureOption !== undefined ? 1 : 0);
  }, 0);
  const progress = Math.round((answeredParts / totalParts) * 100);

  return (
    <UserLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-indigo-100 text-lg">{survey.description}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 sticky top-4 z-10 border border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Survey Progress</span>
            </div>
            <span className="text-lg font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {answeredParts} of {totalParts} responses completed
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {survey.questions.map((q, idx) => (
            <div key={q._id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-6 flex items-center gap-4">
                <span className="bg-teal-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                  {q.questionNumber || idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-xl">{q.question}</p>
                  {q.required && (
                    <span className="inline-flex items-center gap-1 text-teal-200 text-sm mt-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Required
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* PRESENT ASPECT */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                    Present Aspect
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Select one option that best describes the current state</p>
                  
                  {/* Check if new structure (presentOptions) or old structure (presentCreativityOptions) */}
                  {q.presentOptions && q.presentOptions.length > 0 ? (
                    // NEW STRUCTURE
                    <div className="space-y-3">
                      {q.presentOptions.map((opt, i) => (
                        <div
                          key={i} 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnswer(q._id, 'presentOption', i, e);
                          }}
                          className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                            answers[q._id]?.presentOption === i 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-lg scale-105' 
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            answers[q._id]?.presentOption === i ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
                          }`}>
                            {answers[q._id]?.presentOption === i && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm font-medium flex-1">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // OLD STRUCTURE - Show message
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This survey uses an old template structure. Please ask your administrator to recreate the survey with an updated template.
                      </p>
                    </div>
                  )}
                </div>

                {/* FUTURE ASPECT */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                    Future Aspect
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Select one option that best describes your future vision</p>
                  
                  {/* Check if new structure (futureOptions) or old structure (futureCreativityOptions) */}
                  {q.futureOptions && q.futureOptions.length > 0 ? (
                    // NEW STRUCTURE
                    <div className="space-y-3">
                      {q.futureOptions.map((opt, i) => (
                        <div
                          key={i} 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAnswer(q._id, 'futureOption', i, e);
                          }}
                          className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                            answers[q._id]?.futureOption === i 
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 shadow-lg scale-105' 
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            answers[q._id]?.futureOption === i ? 'border-purple-600 bg-purple-600' : 'border-gray-400'
                          }`}>
                            {answers[q._id]?.futureOption === i && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className="text-sm font-medium flex-1">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // OLD STRUCTURE - Show message
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This survey uses an old template structure. Please ask your administrator to recreate the survey with an updated template.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10 mb-12">
          <button 
            onClick={handleSaveDraft} 
            disabled={saving}
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {loading ? 'Submitting...' : 'Submit Survey'}
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserSurvey;
