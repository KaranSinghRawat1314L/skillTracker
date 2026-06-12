const resultService = require('../services/resultService');

async function evaluateQuiz(req, res, next) {
  try {
    const { quizId, userAnswers, timeTaken = 0 } = req.body;
    if (!quizId || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: 'quizId and userAnswers are required' });
    }
    const result = await resultService.evaluateQuiz({
      quizId,
      userAnswers,
      timeTaken,
      userId: req.user._id,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyResults(req, res, next) {
  try {
    const results = await resultService.getResultsByUser(req.user._id);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function getResultByQuiz(req, res, next) {
  try {
    const result = await resultService.getResultByQuizId(req.params.quizId, req.user._id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { evaluateQuiz, getMyResults, getResultByQuiz };
