const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionNumber: { type: String },
  selectedOptionIndex: { type: Number },
  creativityOptionIndex: { type: Number },
  moralityOptionIndex: { type: Number },
  creativityMarks: { type: Number, default: 0 },
  moralityMarks: { type: Number, default: 0 }
});

const surveyResponseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  answers: [answerSchema],
  totalCreativityMarks: { type: Number, default: 0 },
  totalMoralityMarks: { type: Number, default: 0 },
  isDraft: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now }
});

surveyResponseSchema.index({ surveyId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
