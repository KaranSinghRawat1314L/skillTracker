const quizService = require('../services/quizService');

async function generateQuiz(req, res, next) {
  try {
    const { skillId, difficulty } = req.body;
    if (!skillId || !difficulty) {
      return res.status(400).json({ message: 'skillId and difficulty are required' });
    }
    const quiz = await quizService.generateQuiz({ skillId, difficulty, userId: req.user._id });
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

async function getQuizzes(req, res, next) {
  try {
    const quizzes = await quizService.getQuizzesByUser(req.user._id);
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
}

async function getQuizzesBySkill(req, res, next) {
  try {
    const quizzes = await quizService.getQuizzesBySkill(req.params.skillId, req.user._id);
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
}

async function getQuizById(req, res, next) {
  try {
    const quiz = await quizService.getQuizById(req.params.id, req.user._id);
    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

module.exports = { generateQuiz, getQuizzes, getQuizzesBySkill, getQuizById };
