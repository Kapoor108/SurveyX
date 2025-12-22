import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';

const defaultCreativityOptions = [
  { text: 'Not at all', marks: 1 },
  { text: 'To a small extent', marks: 2 },
  { text: 'To a moderate extent', marks: 3 },
  { text: 'To a great extent', marks: 4 },
  { text: 'Completely', marks: 5 },
  { text: 'Unable to Assess', marks: 0 }
];

const defaultMoralityOptions = [
  { text: 'Not at all', marks: 1 },
  { text: 'To a small extent', marks: 2 },
  { text: 'To a moderate extent', marks: 3 },
  { text: 'To a great extent', marks: 4 },
  { text: 'Completely', marks: 5 },
  { text: 'Unable to Assess', marks: 0 }
];

const AdminTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', questions: [] });
  const [newQuestion, setNewQuestion] = useState({
    questionNumber: '',
    question: '',
    creativityOptions: JSON.parse(JSON.stringify(defaultCreativityOptions)),
    moralityOptions: JSON.parse(JSON.stringify(defaultMoralityOptions)),
    required: true
  });

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = () => api.get('/admin/surveys/templates').then(res => setTemplates(res.data));

  const resetNewQuestion = () => {
    setNewQuestion({
      questionNumber: '',
      question: '',
      creativityOptions: JSON.parse(JSON.stringify(defaultCreativityOptions)),
      moralityOptions: JSON.parse(JSON.stringify(defaultMoralityOptions)),
      required: true
    });
    setEditingQuestionIndex(null);
  };

  const addOrUpdateQuestion = () => {
    if (!newQuestion.question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (!newQuestion.questionNumber.trim()) {
      alert('Please enter a question number');
      return;
    }
    
    const validCreativity = newQuestion.creativityOptions.filter(o => o.text && o.text.trim());
    const validMorality = newQuestion.moralityOptions.filter(o => o.text && o.text.trim());
    
    if (validCreativity.length < 2) {
      alert('At least 2 creativity options required');
      return;
    }
    if (validMorality.length < 2) {
      alert('At least 2 morality options required');
      return;
    }
    
    const questionData = {
      questionNumber: newQuestion.questionNumber.trim(),
      question: newQuestion.question.trim(),
      creativityOptions: validCreativity.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
      moralityOptions: validMorality.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
      required: newQuestion.required
    };
    
    if (editingQuestionIndex !== null && editingQuestionIndex >= 0) {
      // Update existing question
      setForm(prevForm => {
        const updatedQuestions = [...prevForm.questions];
        updatedQuestions[editingQuestionIndex] = questionData;
        return { ...prevForm, questions: updatedQuestions };
      });
    } else {
      // Add new question
      setForm(prevForm => ({
        ...prevForm,
        questions: [...prevForm.questions, questionData]
      }));
    }
    
    // Reset after update
    setNewQuestion({
      questionNumber: '',
      question: '',
      creativityOptions: JSON.parse(JSON.stringify(defaultCreativityOptions)),
      moralityOptions: JSON.parse(JSON.stringify(defaultMoralityOptions)),
      required: true
    });
    setEditingQuestionIndex(null);
  };

  const editQuestion = (index) => {
    const q = form.questions[index];
    setNewQuestion({
      questionNumber: q.questionNumber || '',
      question: q.question,
      creativityOptions: q.creativityOptions?.map(o => ({ text: o.text, marks: o.marks || 0 })) || [],
      moralityOptions: q.moralityOptions?.map(o => ({ text: o.text, marks: o.marks || 0 })) || [],
      required: q.required !== false
    });
    setEditingQuestionIndex(index);
  };

  const cancelEditQuestion = () => {
    resetNewQuestion();
  };

  const deleteQuestion = (index) => {
    if (editingQuestionIndex === index) {
      resetNewQuestion();
    }
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setForm({ title: '', description: '', questions: [] });
    resetNewQuestion();
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    const cleanQuestions = (template.questions || []).map(q => ({
      questionNumber: q.questionNumber || '',
      question: q.question,
      creativityOptions: (q.creativityOptions || []).map(o => ({ text: o.text, marks: o.marks || 0 })),
      moralityOptions: (q.moralityOptions || []).map(o => ({ text: o.text, marks: o.marks || 0 })),
      required: q.required !== false
    }));
    setForm({ title: template.title, description: template.description || '', questions: cleanQuestions });
    resetNewQuestion();
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (saving) return; // Prevent double submission
    
    let questionsToSave = [...form.questions];
    
    // Check if there's a question being typed in the form (new or editing)
    if (newQuestion.question.trim() && newQuestion.questionNumber.trim()) {
      const validCreativity = newQuestion.creativityOptions.filter(o => o.text && o.text.trim());
      const validMorality = newQuestion.moralityOptions.filter(o => o.text && o.text.trim());
      
      if (validCreativity.length >= 2 && validMorality.length >= 2) {
        const questionData = {
          questionNumber: newQuestion.questionNumber.trim(),
          question: newQuestion.question.trim(),
          creativityOptions: validCreativity.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
          moralityOptions: validMorality.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
          required: newQuestion.required
        };
        
        if (editingQuestionIndex !== null) {
          // Update existing question
          questionsToSave[editingQuestionIndex] = questionData;
        } else {
          // Add as new question
          questionsToSave.push(questionData);
        }
      }
    }
    
    if (questionsToSave.length === 0) {
      alert('Add at least one question');
      return;
    }
    
    const dataToSave = { ...form, questions: questionsToSave };
    
    setSaving(true);
    try {
      if (editingTemplate) {
        await api.put(`/admin/surveys/templates/${editingTemplate._id}`, dataToSave);
      } else {
        await api.post('/admin/surveys/template', dataToSave);
      }
      setShowModal(false);
      setForm({ title: '', description: '', questions: [] });
      setEditingTemplate(null);
      resetNewQuestion();
      loadTemplates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await api.delete(`/admin/surveys/templates/${id}`);
      loadTemplates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const updateCreativityOption = (index, field, value) => {
    const opts = [...newQuestion.creativityOptions];
    opts[index] = { ...opts[index], [field]: field === 'marks' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, creativityOptions: opts });
  };

  const updateMoralityOption = (index, field, value) => {
    const opts = [...newQuestion.moralityOptions];
    opts[index] = { ...opts[index], [field]: field === 'marks' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, moralityOptions: opts });
  };

  const addCreativityOption = () => {
    setNewQuestion({
      ...newQuestion,
      creativityOptions: [...newQuestion.creativityOptions, { text: '', marks: 0 }]
    });
  };

  const addMoralityOption = () => {
    setNewQuestion({
      ...newQuestion,
      moralityOptions: [...newQuestion.moralityOptions, { text: '', marks: 0 }]
    });
  };

  const removeCreativityOption = (index) => {
    if (newQuestion.creativityOptions.length <= 2) return;
    setNewQuestion({
      ...newQuestion,
      creativityOptions: newQuestion.creativityOptions.filter((_, i) => i !== index)
    });
  };

  const removeMoralityOption = (index) => {
    if (newQuestion.moralityOptions.length <= 2) return;
    setNewQuestion({
      ...newQuestion,
      moralityOptions: newQuestion.moralityOptions.filter((_, i) => i !== index)
    });
  };

  return (
    <Layout title="Survey Templates">
      <div className="mb-4">
        <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.description}</p>
            <p className="text-sm"><span className="text-gray-500">Questions:</span> {t.questions?.length || 0}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setViewModal(t)} className="flex-1 px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">View</button>
              <button onClick={() => openEditModal(t)} className="flex-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200">Edit</button>
              <button onClick={() => handleDelete(t._id)} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto py-8 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{viewModal.title}</h2>
                <p className="text-gray-600 mt-1">{viewModal.description}</p>
              </div>
              <button onClick={() => setViewModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-6">
              {viewModal.questions?.map((q, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="bg-teal-700 text-white px-4 py-3 flex items-center gap-3">
                    <span className="bg-teal-900 px-3 py-1 rounded-full text-sm font-medium">{q.questionNumber || i + 1}</span>
                    <span className="font-medium">{q.question}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide">Creativity Options</h4>
                      <div className="space-y-2">
                        {q.creativityOptions?.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-sm bg-indigo-50 px-3 py-2 rounded">
                            <span>{opt.text}</span>
                            <span className="text-indigo-600 font-medium">{opt.marks} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Morality Options</h4>
                      <div className="space-y-2">
                        {q.moralityOptions?.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-sm bg-green-50 px-3 py-2 rounded">
                            <span>{opt.text}</span>
                            <span className="text-green-600 font-medium">{opt.marks} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setViewModal(null); openEditModal(viewModal); }} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button>
              <button onClick={() => setViewModal(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto py-8 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{editingTemplate ? 'Edit Survey Template' : 'Create Survey Template'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Questions ({form.questions.length})</h3>
                
                {/* Existing Questions - Clickable to Edit */}
                {form.questions.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
                    {form.questions.map((q, i) => (
                      <div key={i} 
                        className={`bg-white p-3 rounded border cursor-pointer transition-all ${
                          editingQuestionIndex === i ? 'border-indigo-500 ring-2 ring-indigo-200' : 'hover:border-indigo-300 hover:shadow'
                        }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => editQuestion(i)}>
                            <div className="flex items-center gap-2">
                              <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs font-medium">
                                {q.questionNumber}
                              </span>
                              <span className="font-medium text-sm">{q.question}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex gap-4">
                              <span>Creativity: {q.creativityOptions?.length} options</span>
                              <span>Morality: {q.moralityOptions?.length} options</span>
                            </div>
                            {editingQuestionIndex !== i && (
                              <p className="text-xs text-indigo-500 mt-1">Click to edit</p>
                            )}
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteQuestion(i); }} 
                            className="text-red-500 hover:text-red-700 text-xl ml-2">&times;</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit Question Form */}
                <div className={`p-4 rounded-lg border ${editingQuestionIndex !== null ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200'}`}>
                  <h4 className={`font-medium mb-3 ${editingQuestionIndex !== null ? 'text-yellow-800' : 'text-blue-800'}`}>
                    {editingQuestionIndex !== null ? `Editing Question ${editingQuestionIndex + 1}` : 'Add New Question'}
                  </h4>
                  
                  <div className="grid grid-cols-6 gap-3 mb-4">
                    <input type="text" placeholder="Q No. (e.g., 6.01)" value={newQuestion.questionNumber}
                      onChange={e => setNewQuestion({ ...newQuestion, questionNumber: e.target.value })}
                      className="col-span-1 px-3 py-2 border rounded text-sm" />
                    <input type="text" placeholder="Enter your question text here" value={newQuestion.question}
                      onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      className="col-span-5 px-3 py-2 border rounded" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Creativity Options */}
                    <div className="bg-white p-3 rounded border">
                      <h5 className="font-medium text-indigo-700 mb-2 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Creativity Options
                      </h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {newQuestion.creativityOptions.map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                              onChange={e => updateCreativityOption(i, 'text', e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm" />
                            <input type="number" value={opt.marks} placeholder="Marks"
                              onChange={e => updateCreativityOption(i, 'marks', e.target.value)}
                              className="w-16 px-2 py-1 border rounded text-sm text-center" />
                            <button type="button" onClick={() => removeCreativityOption(i)} 
                              className="text-red-400 hover:text-red-600 text-sm">×</button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addCreativityOption} className="text-xs text-indigo-600 hover:text-indigo-800 mt-2">
                        + Add Option
                      </button>
                    </div>
                    
                    {/* Morality Options */}
                    <div className="bg-white p-3 rounded border">
                      <h5 className="font-medium text-green-700 mb-2 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Morality Options
                      </h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {newQuestion.moralityOptions.map((opt, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                              onChange={e => updateMoralityOption(i, 'text', e.target.value)}
                              className="flex-1 px-2 py-1 border rounded text-sm" />
                            <input type="number" value={opt.marks} placeholder="Marks"
                              onChange={e => updateMoralityOption(i, 'marks', e.target.value)}
                              className="w-16 px-2 py-1 border rounded text-sm text-center" />
                            <button type="button" onClick={() => removeMoralityOption(i)} 
                              className="text-red-400 hover:text-red-600 text-sm">×</button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addMoralityOption} className="text-xs text-green-600 hover:text-green-800 mt-2">
                        + Add Option
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={addOrUpdateQuestion} 
                      className={`px-4 py-2 text-white rounded ${editingQuestionIndex !== null ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </button>
                    {editingQuestionIndex !== null && (
                      <button type="button" onClick={cancelEditQuestion} className="px-4 py-2 border rounded hover:bg-gray-50">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={() => { setShowModal(false); setEditingTemplate(null); resetNewQuestion(); }} 
                  className="px-4 py-2 border rounded hover:bg-gray-50" disabled={saving}>Cancel</button>
                <button type="submit" disabled={saving}
                  className={`px-4 py-2 text-white rounded ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {saving ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminTemplates;
