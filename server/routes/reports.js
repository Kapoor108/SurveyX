const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Organization = require('../models/Organization');
const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');
const Employee = require('../models/Employee');

router.use(auth, isAdmin);

// Calculate band based on percentage
const getBand = (percentage) => {
  if (percentage < 40) return 'Early';
  if (percentage < 50) return 'Emerging';
  return 'Leading';
};

// Calculate quadrant based on creativity and morality percentages
const getQuadrant = (creativityPercentage, moralityPercentage) => {
  if (creativityPercentage >= 50 && moralityPercentage >= 50) {
    return 'Hope in Action (IGEN Zone)';
  } else if (creativityPercentage >= 50 && moralityPercentage < 50) {
    return 'Unbounded Power';
  } else if (creativityPercentage < 50 && moralityPercentage >= 50) {
    return 'Safe Stagnation';
  } else {
    return 'Extraction Engine';
  }
};

// Calculate scores for a single response
const calculateResponseScores = (response) => {
  let presentCreativityTotal = 0;
  let presentMoralityTotal = 0;
  let futureCreativityTotal = 0;
  let futureMoralityTotal = 0;
  
  response.answers.forEach(answer => {
    const question = response.surveyId.questions.find(q => q._id.toString() === answer.questionId.toString());
    if (!question) return;

    // Present Aspect
    if (answer.presentCreativityOptionIndex !== undefined) {
      const option = question.presentCreativityOptions[answer.presentCreativityOptionIndex];
      if (option) presentCreativityTotal += (option.marks || 0);
    }
    if (answer.presentMoralityOptionIndex !== undefined) {
      const option = question.presentMoralityOptions[answer.presentMoralityOptionIndex];
      if (option) presentMoralityTotal += (option.marks || 0);
    }

    // Future Aspect
    if (answer.futureCreativityOptionIndex !== undefined) {
      const option = question.futureCreativityOptions[answer.futureCreativityOptionIndex];
      if (option) futureCreativityTotal += (option.marks || 0);
    }
    if (answer.futureMoralityOptionIndex !== undefined) {
      const option = question.futureMoralityOptions[answer.futureMoralityOptionIndex];
      if (option) futureMoralityTotal += (option.marks || 0);
    }
  });

  // Calculate max possible score (assuming 20 questions, max 3 marks each)
  const maxScore = response.surveyId.questions.length * 3;

  // Calculate percentages
  const presentCreativityPercentage = maxScore > 0 ? ((presentCreativityTotal / maxScore) * 100).toFixed(1) : 0;
  const presentMoralityPercentage = maxScore > 0 ? ((presentMoralityTotal / maxScore) * 100).toFixed(1) : 0;
  const futureCreativityPercentage = maxScore > 0 ? ((futureCreativityTotal / maxScore) * 100).toFixed(1) : 0;
  const futureMoralityPercentage = maxScore > 0 ? ((futureMoralityTotal / maxScore) * 100).toFixed(1) : 0;

  return {
    present: {
      creativity_total: presentCreativityTotal,
      morality_total: presentMoralityTotal,
      creativity_percentage: parseFloat(presentCreativityPercentage),
      morality_percentage: parseFloat(presentMoralityPercentage),
      creativity_band: getBand(parseFloat(presentCreativityPercentage)),
      morality_band: getBand(parseFloat(presentMoralityPercentage)),
      quadrant: getQuadrant(parseFloat(presentCreativityPercentage), parseFloat(presentMoralityPercentage))
    },
    future: {
      creativity_total: futureCreativityTotal,
      morality_total: futureMoralityTotal,
      creativity_percentage: parseFloat(futureCreativityPercentage),
      morality_percentage: parseFloat(futureMoralityPercentage),
      creativity_band: getBand(parseFloat(futureCreativityPercentage)),
      morality_band: getBand(parseFloat(futureMoralityPercentage)),
      quadrant: getQuadrant(parseFloat(futureCreativityPercentage), parseFloat(futureMoralityPercentage))
    },
    maxScore
  };
};

// Get organization report
router.get('/organizations/:orgId', async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get all surveys for this organization
    const surveys = await Survey.find({ orgId: req.params.orgId, isTemplate: false })
      .populate('createdBy', 'name email');

    // Get all responses for these surveys
    const surveyIds = surveys.map(s => s._id);
    const responses = await SurveyResponse.find({ 
      surveyId: { $in: surveyIds },
      isDraft: false 
    })
      .populate('surveyId')
      .populate('employeeId', 'name email departmentId')
      .populate({
        path: 'employeeId',
        populate: { path: 'departmentId', select: 'name' }
      });

    // Calculate scores for each survey
    const surveyReports = [];
    
    for (const survey of surveys) {
      const surveyResponses = responses.filter(r => r.surveyId._id.toString() === survey._id.toString());
      
      if (surveyResponses.length === 0) {
        surveyReports.push({
          survey: {
            id: survey._id,
            title: survey.title,
            description: survey.description,
            createdBy: survey.createdBy,
            createdAt: survey.createdAt
          },
          totalResponses: 0,
          responses: [],
          aggregateScores: null
        });
        continue;
      }

      // Calculate scores for each response
      const responseScores = surveyResponses.map(response => {
        const scores = calculateResponseScores(response);
        return {
          employee: {
            id: response.employeeId._id,
            name: response.employeeId.name,
            email: response.employeeId.email,
            department: response.employeeId.departmentId?.name || 'N/A'
          },
          submittedAt: response.submittedAt,
          scores
        };
      });

      // Calculate aggregate scores
      const aggregateScores = {
        present: {
          avgCreativityPercentage: 0,
          avgMoralityPercentage: 0,
          avgCreativityTotal: 0,
          avgMoralityTotal: 0,
          quadrantDistribution: {}
        },
        future: {
          avgCreativityPercentage: 0,
          avgMoralityTotal: 0,
          avgCreativityTotal: 0,
          avgMoralityPercentage: 0,
          quadrantDistribution: {}
        }
      };

      if (responseScores.length > 0) {
        // Present aspect averages
        aggregateScores.present.avgCreativityPercentage = (
          responseScores.reduce((sum, r) => sum + r.scores.present.creativity_percentage, 0) / responseScores.length
        ).toFixed(1);
        aggregateScores.present.avgMoralityPercentage = (
          responseScores.reduce((sum, r) => sum + r.scores.present.morality_percentage, 0) / responseScores.length
        ).toFixed(1);
        aggregateScores.present.avgCreativityTotal = (
          responseScores.reduce((sum, r) => sum + r.scores.present.creativity_total, 0) / responseScores.length
        ).toFixed(1);
        aggregateScores.present.avgMoralityTotal = (
          responseScores.reduce((sum, r) => sum + r.scores.present.morality_total, 0) / responseScores.length
        ).toFixed(1);

        // Future aspect averages
        aggregateScores.future.avgCreativityPercentage = (
          responseScores.reduce((sum, r) => sum + r.scores.future.creativity_percentage, 0) / responseScores.length
        ).toFixed(1);
        aggregateScores.future.avgMoralityPercentage = (
          responseScores.reduce((sum, r) => sum + r.scores.future.morality_percentage, 0) / responseScores.length
        ).toFixed(1);
        aggregateScores.future.avgCreativityTotal = (
          responseScores.reduce((sum, r) => sum + r.scores.future.creativity_total, 0) / responseScores.length
        ).toFixed(1);
        aggregateScores.future.avgMoralityTotal = (
          responseScores.reduce((sum, r) => sum + r.scores.future.morality_total, 0) / responseScores.length
        ).toFixed(1);

        // Quadrant distribution
        responseScores.forEach(r => {
          const presentQuad = r.scores.present.quadrant;
          const futureQuad = r.scores.future.quadrant;
          aggregateScores.present.quadrantDistribution[presentQuad] = 
            (aggregateScores.present.quadrantDistribution[presentQuad] || 0) + 1;
          aggregateScores.future.quadrantDistribution[futureQuad] = 
            (aggregateScores.future.quadrantDistribution[futureQuad] || 0) + 1;
        });
      }

      surveyReports.push({
        survey: {
          id: survey._id,
          title: survey.title,
          description: survey.description,
          createdBy: survey.createdBy,
          createdAt: survey.createdAt,
          questionCount: survey.questions.length
        },
        totalResponses: surveyResponses.length,
        responses: responseScores,
        aggregateScores
      });
    }

    // Get employee count
    const employeeCount = await Employee.countDocuments({ orgId: req.params.orgId });

    res.json({
      organization: {
        id: org._id,
        name: org.name,
        ceoEmail: org.ceoEmail,
        status: org.status,
        employeeCount
      },
      surveyReports,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get organization report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get survey-specific report
router.get('/surveys/:surveyId', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.surveyId)
      .populate('orgId', 'name')
      .populate('createdBy', 'name email');

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const responses = await SurveyResponse.find({ 
      surveyId: req.params.surveyId,
      isDraft: false 
    })
      .populate('employeeId', 'name email departmentId')
      .populate({
        path: 'employeeId',
        populate: { path: 'departmentId', select: 'name' }
      });

    const responseScores = responses.map(response => {
      const scores = calculateResponseScores(response);
      return {
        employee: {
          id: response.employeeId._id,
          name: response.employeeId.name,
          email: response.employeeId.email,
          department: response.employeeId.departmentId?.name || 'N/A'
        },
        submittedAt: response.submittedAt,
        scores
      };
    });

    res.json({
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        organization: survey.orgId,
        createdBy: survey.createdBy,
        createdAt: survey.createdAt,
        questionCount: survey.questions.length
      },
      totalResponses: responses.length,
      responses: responseScores,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get survey report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
