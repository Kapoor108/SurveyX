import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';

const defaultPresentCreativityOptions = [
  { text: 'Not at all', marks: 1 },
  { text: 'To a small extent', marks: 2 },
  { text: 'To a moderate extent', marks: 3 },
  { text: 'To a great extent', marks: 4 },
  { text: 'Completely', marks: 5 },
  { text: 'Unable to Assess', marks: 0 }
];

const defaultPresentMoralityOptions = [
  { text: 'Not at all', marks: 1 },
  { text: 'To a small extent', marks: 2 },
  { text: 'To a moderate extent', marks: 3 },
  { text: 'To a great extent', marks: 4 },
  { text: 'Completely', marks: 5 },
  { text: 'Unable to Assess', marks: 0 }
];

const defaultFutureCreativityOptions = [
  { text: 'Not at all', marks: 1 },
  { text: 'To a small extent', marks: 2 },
  { text: 'To a moderate extent', marks: 3 },
  { text: 'To a great extent', marks: 4 },
  { text: 'Completely', marks: 5 },
  { text: 'Unable to Assess', marks: 0 }
];

const defaultFutureMoralityOptions = [
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
    presentCreativityOptions: JSON.parse(JSON.stringify(defaultPresentCreativityOptions)),
    presentMoralityOptions: JSON.parse(JSON.stringify(defaultPresentMoralityOptions)),
    futureCreativityOptions: JSON.parse(JSON.stringify(defaultFutureCreativityOptions)),
    futureMoralityOptions: JSON.parse(JSON.stringify(defaultFutureMoralityOptions)),
    required: true
  });

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = () => api.get('/admin/surveys/templates').then(res => setTemplates(res.data));

  const resetNewQuestion = () => {
    setNewQuestion({
      questionNumber: '',
      question: '',
      presentCreativityOptions: JSON.parse(JSON.stringify(defaultPresentCreativityOptions)),
      presentMoralityOptions: JSON.parse(JSON.stringify(defaultPresentMoralityOptions)),
      futureCreativityOptions: JSON.parse(JSON.stringify(defaultFutureCreativityOptions)),
      futureMoralityOptions: JSON.parse(JSON.stringify(defaultFutureMoralityOptions)),
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
    
    const validPresentCreativity = newQuestion.presentCreativityOptions.filter(o => o.text && o.text.trim());
    const validPresentMorality = newQuestion.presentMoralityOptions.filter(o => o.text && o.text.trim());
    const validFutureCreativity = newQuestion.futureCreativityOptions.filter(o => o.text && o.text.trim());
    const validFutureMorality = newQuestion.futureMoralityOptions.filter(o => o.text && o.text.trim());
    
    if (validPresentCreativity.length < 2) {
      alert('At least 2 present creativity options required');
      return;
    }
    if (validPresentMorality.length < 2) {
      alert('At least 2 present morality options required');
      return;
    }
    if (validFutureCreativity.length < 2) {
      alert('At least 2 future creativity options required');
      return;
    }
    if (validFutureMorality.length < 2) {
      alert('At least 2 future morality options required');
      return;
    }
    
    const questionData = {
      questionNumber: newQuestion.questionNumber.trim(),
      question: newQuestion.question.trim(),
      presentCreativityOptions: validPresentCreativity.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
      presentMoralityOptions: validPresentMorality.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
      futureCreativityOptions: validFutureCreativity.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
      futureMoralityOptions: validFutureMorality.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
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
      presentCreativityOptions: JSON.parse(JSON.stringify(defaultPresentCreativityOptions)),
      presentMoralityOptions: JSON.parse(JSON.stringify(defaultPresentMoralityOptions)),
      futureCreativityOptions: JSON.parse(JSON.stringify(defaultFutureCreativityOptions)),
      futureMoralityOptions: JSON.parse(JSON.stringify(defaultFutureMoralityOptions)),
      required: true
    });
    setEditingQuestionIndex(null);
  };

  const editQuestion = (index) => {
    const q = form.questions[index];
    setNewQuestion({
      questionNumber: q.questionNumber || '',
      question: q.question,
      presentCreativityOptions: q.presentCreativityOptions?.map(o => ({ text: o.text, marks: o.marks || 0 })) || [],
      presentMoralityOptions: q.presentMoralityOptions?.map(o => ({ text: o.text, marks: o.marks || 0 })) || [],
      futureCreativityOptions: q.futureCreativityOptions?.map(o => ({ text: o.text, marks: o.marks || 0 })) || [],
      futureMoralityOptions: q.futureMoralityOptions?.map(o => ({ text: o.text, marks: o.marks || 0 })) || [],
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
      presentCreativityOptions: (q.presentCreativityOptions || []).map(o => ({ text: o.text, marks: o.marks || 0 })),
      presentMoralityOptions: (q.presentMoralityOptions || []).map(o => ({ text: o.text, marks: o.marks || 0 })),
      futureCreativityOptions: (q.futureCreativityOptions || []).map(o => ({ text: o.text, marks: o.marks || 0 })),
      futureMoralityOptions: (q.futureMoralityOptions || []).map(o => ({ text: o.text, marks: o.marks || 0 })),
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
      const validPresentCreativity = newQuestion.presentCreativityOptions.filter(o => o.text && o.text.trim());
      const validPresentMorality = newQuestion.presentMoralityOptions.filter(o => o.text && o.text.trim());
      const validFutureCreativity = newQuestion.futureCreativityOptions.filter(o => o.text && o.text.trim());
      const validFutureMorality = newQuestion.futureMoralityOptions.filter(o => o.text && o.text.trim());
      
      if (validPresentCreativity.length >= 2 && validPresentMorality.length >= 2 && 
          validFutureCreativity.length >= 2 && validFutureMorality.length >= 2) {
        const questionData = {
          questionNumber: newQuestion.questionNumber.trim(),
          question: newQuestion.question.trim(),
          presentCreativityOptions: validPresentCreativity.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
          presentMoralityOptions: validPresentMorality.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
          futureCreativityOptions: validFutureCreativity.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
          futureMoralityOptions: validFutureMorality.map(o => ({ text: o.text.trim(), marks: Number(o.marks) || 0 })),
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
    const opts = [...newQuestion.presentCreativityOptions];
    opts[index] = { ...opts[index], [field]: field === 'marks' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, presentCreativityOptions: opts });
  };

  const updateMoralityOption = (index, field, value) => {
    const opts = [...newQuestion.presentMoralityOptions];
    opts[index] = { ...opts[index], [field]: field === 'marks' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, presentMoralityOptions: opts });
  };

  const updateFutureCreativityOption = (index, field, value) => {
    const opts = [...newQuestion.futureCreativityOptions];
    opts[index] = { ...opts[index], [field]: field === 'marks' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, futureCreativityOptions: opts });
  };

  const updateFutureMoralityOption = (index, field, value) => {
    const opts = [...newQuestion.futureMoralityOptions];
    opts[index] = { ...opts[index], [field]: field === 'marks' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, futureMoralityOptions: opts });
  };

  const addCreativityOption = () => {
    setNewQuestion({
      ...newQuestion,
      presentCreativityOptions: [...newQuestion.presentCreativityOptions, { text: '', marks: 0 }]
    });
  };

  const addMoralityOption = () => {
    setNewQuestion({
      ...newQuestion,
      presentMoralityOptions: [...newQuestion.presentMoralityOptions, { text: '', marks: 0 }]
    });
  };

  const addFutureCreativityOption = () => {
    setNewQuestion({
      ...newQuestion,
      futureCreativityOptions: [...newQuestion.futureCreativityOptions, { text: '', marks: 0 }]
    });
  };

  const addFutureMoralityOption = () => {
    setNewQuestion({
      ...newQuestion,
      futureMoralityOptions: [...newQuestion.futureMoralityOptions, { text: '', marks: 0 }]
    });
  };

  const removeCreativityOption = (index) => {
    if (newQuestion.presentCreativityOptions.length <= 2) return;
    setNewQuestion({
      ...newQuestion,
      presentCreativityOptions: newQuestion.presentCreativityOptions.filter((_, i) => i !== index)
    });
  };

  const removeMoralityOption = (index) => {
    if (newQuestion.presentMoralityOptions.length <= 2) return;
    setNewQuestion({
      ...newQuestion,
      presentMoralityOptions: newQuestion.presentMoralityOptions.filter((_, i) => i !== index)
    });
  };

  const removeFutureCreativityOption = (index) => {
    if (newQuestion.futureCreativityOptions.length <= 2) return;
    setNewQuestion({
      ...newQuestion,
      futureCreativityOptions: newQuestion.futureCreativityOptions.filter((_, i) => i !== index)
    });
  };

  const removeFutureMoralityOption = (index) => {
    if (newQuestion.futureMoralityOptions.length <= 2) return;
    setNewQuestion({
      ...newQuestion,
      futureMoralityOptions: newQuestion.futureMoralityOptions.filter((_, i) => i !== index)
    });
  };

  return (
    <AdminLayout title="Survey Templates">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-600">Create and manage survey templates for organizations</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-indigo-200 transition-all">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{t.questions?.length || 0}</span>
                <span>Questions</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setViewModal(t)} 
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                View
              </button>
              <button 
                onClick={() => openEditModal(t)} 
                className="flex-1 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(t._id)} 
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
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
                  
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {/* Present Aspect */}
                    <div className="col-span-2 border-b pb-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Present Aspect</h3>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-indigo-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        Creativity (C)
                      </h4>
                      <div className="space-y-2">
                        {q.presentCreativityOptions?.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded shadow-sm">
                            <span>{opt.text}</span>
                            <span className="text-indigo-600 font-medium">{opt.marks} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Morality (M)
                      </h4>
                      <div className="space-y-2">
                        {q.presentMoralityOptions?.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded shadow-sm">
                            <span>{opt.text}</span>
                            <span className="text-green-600 font-medium">{opt.marks} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Future Aspect */}
                    <div className="col-span-2 border-b pb-2 mb-2 mt-4">
                      <h3 className="text-lg font-semibold text-gray-800">Future Aspect</h3>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Creativity (C)
                      </h4>
                      <div className="space-y-2">
                        {q.futureCreativityOptions?.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded shadow-sm">
                            <span>{opt.text}</span>
                            <span className="text-purple-600 font-medium">{opt.marks} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-orange-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Morality (M)
                      </h4>
                      <div className="space-y-2">
                        {q.futureMoralityOptions?.map((opt, j) => (
                          <div key={j} className="flex justify-between items-center text-sm bg-white px-3 py-2 rounded shadow-sm">
                            <span>{opt.text}</span>
                            <span className="text-orange-600 font-medium">{opt.marks} pts</span>
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
                              <span>Present: C({q.presentCreativityOptions?.length}) M({q.presentMoralityOptions?.length})</span>
                              <span>Future: C({q.futureCreativityOptions?.length}) M({q.futureMoralityOptions?.length})</span>
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
                      className="col-span-1 px-3 py-2 border rounded text-sm bg-white" />
                    <input type="text" placeholder="Enter your question text here" value={newQuestion.question}
                      onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      className="col-span-5 px-3 py-2 border rounded bg-white" />
                  </div>
                  
                  {/* Present Aspect */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      Present Aspect
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Present Creativity Options */}
                      <div className="bg-white p-3 rounded border border-indigo-200">
                        <h6 className="font-medium text-indigo-700 mb-2 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                          Creativity (C)
                        </h6>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {newQuestion.presentCreativityOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                                onChange={e => updateCreativityOption(i, 'text', e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-sm" />
                              <input type="number" value={opt.marks} placeholder="Pts"
                                onChange={e => updateCreativityOption(i, 'marks', e.target.value)}
                                className="w-14 px-2 py-1 border rounded text-sm text-center" />
                              <button type="button" onClick={() => removeCreativityOption(i)} 
                                className="text-red-400 hover:text-red-600 text-lg">×</button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addCreativityOption} className="text-xs text-indigo-600 hover:text-indigo-800 mt-2">
                          + Add Option
                        </button>
                      </div>
                      
                      {/* Present Morality Options */}
                      <div className="bg-white p-3 rounded border border-green-200">
                        <h6 className="font-medium text-green-700 mb-2 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Morality (M)
                        </h6>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {newQuestion.presentMoralityOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                                onChange={e => updateMoralityOption(i, 'text', e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-sm" />
                              <input type="number" value={opt.marks} placeholder="Pts"
                                onChange={e => updateMoralityOption(i, 'marks', e.target.value)}
                                className="w-14 px-2 py-1 border rounded text-sm text-center" />
                              <button type="button" onClick={() => removeMoralityOption(i)} 
                                className="text-red-400 hover:text-red-600 text-lg">×</button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addMoralityOption} className="text-xs text-green-600 hover:text-green-800 mt-2">
                          + Add Option
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Future Aspect */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                      Future Aspect
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Future Creativity Options */}
                      <div className="bg-white p-3 rounded border border-purple-200">
                        <h6 className="font-medium text-purple-700 mb-2 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Creativity (C)
                        </h6>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {newQuestion.futureCreativityOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                                onChange={e => updateFutureCreativityOption(i, 'text', e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-sm" />
                              <input type="number" value={opt.marks} placeholder="Pts"
                                onChange={e => updateFutureCreativityOption(i, 'marks', e.target.value)}
                                className="w-14 px-2 py-1 border rounded text-sm text-center" />
                              <button type="button" onClick={() => removeFutureCreativityOption(i)} 
                                className="text-red-400 hover:text-red-600 text-lg">×</button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addFutureCreativityOption} className="text-xs text-purple-600 hover:text-purple-800 mt-2">
                          + Add Option
                        </button>
                      </div>
                      
                      {/* Future Morality Options */}
                      <div className="bg-white p-3 rounded border border-orange-200">
                        <h6 className="font-medium text-orange-700 mb-2 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Morality (M)
                        </h6>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {newQuestion.futureMoralityOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input type="text" placeholder={`Option ${i + 1}`} value={opt.text}
                                onChange={e => updateFutureMoralityOption(i, 'text', e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-sm" />
                              <input type="number" value={opt.marks} placeholder="Pts"
                                onChange={e => updateFutureMoralityOption(i, 'marks', e.target.value)}
                                className="w-14 px-2 py-1 border rounded text-sm text-center" />
                              <button type="button" onClick={() => removeFutureMoralityOption(i)} 
                                className="text-red-400 hover:text-red-600 text-lg">×</button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addFutureMoralityOption} className="text-xs text-orange-600 hover:text-orange-800 mt-2">
                          + Add Option
                        </button>
                      </div>
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
    </AdminLayout>
  );
};

export default AdminTemplates;
