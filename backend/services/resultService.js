const axios = require('axios');
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');

const GEMINI_EVAL_URL =
  process.env.GEMINI_API_URL ||
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function evaluateQuiz({ quizId, userAnswers, timeTaken, userId }) {
  const quiz = await Quiz.findOne({ _id: quizId, createdBy: userId });
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }

  // Calculate score and percentage
  const score = quiz.questions.reduce(
    (acc, q, i) => acc + (userAnswers[i] === q.answer ? 1 : 0),
    0
  );
  const percentage = Math.round((score / quiz.questions.length) * 100);

  // Ask Gemini for personalised feedback (non-fatal if it fails)
  let aiFeedback = '';
  try {
    const evalData = quiz.questions.map((q, i) => ({
      question:      q.prompt,
      correctAnswer: q.answer,
      userAnswer:    userAnswers[i] || '(no answer)',
      isCorrect:     userAnswers[i] === q.answer,
      explanation:   q.explanation,
    }));

    const prompt = `You are a helpful learning coach. A student just completed a quiz.

Quiz results:
${JSON.stringify(evalData, null, 2)}

Provide brief, encouraging feedback (under 150 words):
1. One sentence summary of their performance.
2. What they got right (if anything).
3. Key concept(s) to review.
4. One concrete next step.`;

    const res = await axios.post(
      `${GEMINI_EVAL_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    aiFeedback = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    console.error('AI feedback failed (non-fatal):', err.message);
  }

  const result = await Result.create({
    userId,
    quizId: quiz._id,
    score,
    percentage,
    timeTaken,
    userAnswers,
    aiFeedback,
  });

  return { score, percentage, total: quiz.questions.length, aiFeedback, resultId: result._id };
}

async function getResultsByUser(userId) {
  return Result.find({ userId })
    .populate({
      path: 'quizId',
      select: 'difficulty skillId questions',
      populate: { path: 'skillId', select: 'name' },
    })
    .sort({ createdAt: -1 });
}

async function getResultByQuizId(quizId, userId) {
  return Result.findOne({ quizId, userId });
}

module.exports = { evaluateQuiz, getResultsByUser, getResultByQuizId };
