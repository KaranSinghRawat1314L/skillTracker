const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    prompt:      { type: String, required: true },
    options:     [{ type: String, required: true }],
    answer:      { type: String, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    skillId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    questions:  { type: [questionSchema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
