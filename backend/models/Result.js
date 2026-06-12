const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    quizId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz',  required: true },
    score:       { type: Number, required: true, min: 0 },
    percentage:  { type: Number, required: true, min: 0, max: 100 },
    timeTaken:   { type: Number, default: 0 },   // seconds
    userAnswers: [{ type: String }],
    aiFeedback:  { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
