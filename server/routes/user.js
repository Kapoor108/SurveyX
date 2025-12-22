const router = require('express').Router();
const { auth, isUser } = require('../middleware/auth');
const SurveyAssignment = require('../models/SurveyAssignment');
const SurveyResponse = require('../models/SurveyResponse');
const Survey = require('../models/Survey');

router.use(auth, isUser);

// User Dashboard - Get assigned surveys
router.get('/dashboard', async (req, res) => {
  try {
    const assignments = await SurveyAssignment.find({ employeeId: req.user._id })
      .populate('surveyId')
      .sort({ assignedAt: -1 });

    const pending = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress');
    const completed = assignments.filter(a => a.status === 'completed');

    res.json({
      pending: pending.map(a => ({
        assignmentId: a._id,
        survey: a.surveyId,
        dueDate: a.dueDate,
        status: a.status,
        daysLeft: a.dueDate ? Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
      })),
      completed: completed.map(a => ({
        assignmentId: a._id,
        survey: a.surveyId,
        completedAt: a.completedAt
      })),
      stats: {
        totalAssigned: assignments.length,
        completed: completed.length,
        pending: pending.length,
        completionRate: assignments.length > 0 ? Math.round((completed.length / assignments.length) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get survey to fill
router.get('/surveys/:id', async (req, res) => {
  try {
    const assignment = await SurveyAssignment.findOne({ 
      surveyId: req.params.id, 
      employeeId: req.user._id 
    });

    if (!assignment) return res.status(404).json({ error: 'Survey not assigned to you' });

    const survey = await Survey.findById(req.params.id);
    const existingResponse = await SurveyResponse.findOne({ 
      surveyId: req.params.id, 
      employeeId: req.user._id 
    });

    res.json({ 
      survey, 
      assignment,
      draft: existingResponse?.isDraft ? existingResponse : null 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save draft
router.post('/surveys/:id/draft', async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Format answers for draft (no marks calculation yet)
    const formattedAnswers = answers.map(a => ({
      questionId: a.questionId,
      creativityOptionIndex: a.creativityOptionIndex,
      moralityOptionIndex: a.moralityOptionIndex
    }));
    
    const response = await SurveyResponse.findOneAndUpdate(
      { surveyId: req.params.id, employeeId: req.user._id },
      {
        surveyId: req.params.id,
        employeeId: req.user._id,
        orgId: req.user.orgId,
        departmentId: req.user.departmentId,
        answers: formattedAnswers,
        isDraft: true
      },
      { upsert: true, new: true }
    );

    await SurveyAssignment.findOneAndUpdate(
      { surveyId: req.params.id, employeeId: req.user._id },
      { status: 'in_progress' }
    );

    res.json({ response, message: 'Draft saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit survey
router.post('/surveys/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Get survey to calculate marks
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    
    let totalCreativityMarks = 0;
    let totalMoralityMarks = 0;
    
    // Calculate marks for each answer
    const formattedAnswers = answers.map(a => {
      const question = survey.questions.find(q => q._id.toString() === a.questionId);
      let creativityMarks = 0;
      let moralityMarks = 0;
      
      if (question) {
        // Get marks from selected creativity option
        if (a.creativityOptionIndex !== undefined && question.creativityOptions && question.creativityOptions[a.creativityOptionIndex]) {
          creativityMarks = question.creativityOptions[a.creativityOptionIndex].marks || 0;
        }
        // Get marks from selected morality option
        if (a.moralityOptionIndex !== undefined && question.moralityOptions && question.moralityOptions[a.moralityOptionIndex]) {
          moralityMarks = question.moralityOptions[a.moralityOptionIndex].marks || 0;
        }
      }
      
      totalCreativityMarks += creativityMarks;
      totalMoralityMarks += moralityMarks;
      
      return {
        questionId: a.questionId,
        questionNumber: question?.questionNumber || '',
        creativityOptionIndex: a.creativityOptionIndex,
        moralityOptionIndex: a.moralityOptionIndex,
        creativityMarks,
        moralityMarks
      };
    });
    
    const response = await SurveyResponse.findOneAndUpdate(
      { surveyId: req.params.id, employeeId: req.user._id },
      {
        surveyId: req.params.id,
        employeeId: req.user._id,
        orgId: req.user.orgId,
        departmentId: req.user.departmentId,
        answers: formattedAnswers,
        totalCreativityMarks,
        totalMoralityMarks,
        isDraft: false,
        submittedAt: new Date()
      },
      { upsert: true, new: true }
    );

    await SurveyAssignment.findOneAndUpdate(
      { surveyId: req.params.id, employeeId: req.user._id },
      { status: 'completed', completedAt: new Date() }
    );

    // Don't return marks to user - only return success message
    res.json({ message: 'Survey submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get survey history - NO marks shown to user
router.get('/history', async (req, res) => {
  try {
    const responses = await SurveyResponse.find({ employeeId: req.user._id, isDraft: false })
      .populate('surveyId', 'title description')
      .sort({ submittedAt: -1 });
    
    // Return only non-sensitive data (no marks)
    const sanitizedResponses = responses.map(r => ({
      id: r._id,
      survey: r.surveyId,
      submittedAt: r.submittedAt
    }));
    
    res.json(sanitizedResponses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
