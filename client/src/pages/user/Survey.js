import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const UserSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: { creativity: optionIndex, morality: optionIndex } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/user/surveys/${id}`).then(res => {
      setSurvey(res.data.survey);
      if (res.data.draft) {
        const draftAnswers = {};
        res.data.draft.answers.forEach(a => {
          draftAnswers[a.questionId] = {
            creativity: a.creativityOptionIndex,
            morality: a.moralityOptionIndex
          };
        });
        setAnswers(draftAnswers);
      }
    });
  }, [id]);

  const handleAnswer = (questionId, category, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: {
        ...answers[questionId],
        [category]: optionIndex
      }
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, ans]) => ({
        questionId,
        creativityOptionIndex: ans.creativity,
        moralityOptionIndex: ans.morality
      }));
      await api.post(`/user/surveys/${id}/draft`, { answers: formattedAnswers });
      alert('Draft saved!');
    } catch (err) {
      alert('Failed to save draft');
    }
    setSaving(false);
  };

  const handleSubmit = async () => {
    // Validate - each question needs both creativity and morality answers
    const unanswered = survey.questions.filter(q => {
      const ans = answers[q._id];
      return q.required && (!ans || ans.creativity === undefined || ans.morality === undefined);
    });
    
    if (unanswered.length > 0) {
      alert(`Please answer all required questions for both Creativity and Morality. Missing: ${unanswered.length} questions`);
      return;
    }

    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, ans]) => ({
        questionId,
        creativityOptionIndex: ans.creativity,
        moralityOptionIndex: ans.morality
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
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Calculate progress - each question has 2 parts (creativity + morality)
  const totalParts = survey.questions.length * 2;
  const answeredParts = Object.values(answers).reduce((acc, ans) => {
    return acc + (ans.creativity !== undefined ? 1 : 0) + (ans.morality !== undefined ? 1 : 0);
  }, 0);
  const progress = Math.round((answeredParts / totalParts) * 100);

  return (
    <Layout title={survey.title}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-0 z-10">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {survey.description && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800">{survey.description}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {survey.questions.map((q, idx) => (
            <div key={q._id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Question Header */}
              <div className="bg-teal-700 text-white px-6 py-4 flex items-center gap-4">
                <span className="bg-teal-900 px-4 py-2 rounded-full text-sm font-bold">
                  {q.questionNumber || idx + 1}
                </span>
                <div>
                  <p className="font-medium text-lg">{q.question}</p>
                  {q.required && <span className="text-teal-200 text-sm">* Required</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Creativity Section */}
                <div className="p-6">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    Creativity
                  </h4>
                  <div className="space-y-2">
                    {q.creativityOptions?.map((opt, i) => (
                      <label key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                        ${answers[q._id]?.creativity === i 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-200 hover:border-indigo-300'}`}>
                        <input type="radio" name={`${q._id}-creativity`} 
                          checked={answers[q._id]?.creativity === i}
                          onChange={() => handleAnswer(q._id, 'creativity', i)}
                          className="sr-only" />
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${answers[q._id]?.creativity === i ? 'border-indigo-500' : 'border-gray-400'}`}>
                          {answers[q._id]?.creativity === i && <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Morality Section */}
                <div className="p-6 bg-gray-50">
                  <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Morality
                  </h4>
                  <div className="space-y-2">
                    {q.moralityOptions?.map((opt, i) => (
                      <label key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                        ${answers[q._id]?.morality === i 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:border-green-300'}`}>
                        <input type="radio" name={`${q._id}-morality`}
                          checked={answers[q._id]?.morality === i}
                          onChange={() => handleAnswer(q._id, 'morality', i)}
                          className="sr-only" />
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${answers[q._id]?.morality === i ? 'border-green-500' : 'border-gray-400'}`}>
                          {answers[q._id]?.morality === i && <span className="w-3 h-3 bg-green-500 rounded-full"></span>}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8 mb-8">
          <button onClick={handleSaveDraft} disabled={saving}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Survey'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default UserSurvey;
