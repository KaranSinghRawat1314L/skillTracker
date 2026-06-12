const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  generateQuiz,
  getQuizzes,
  getQuizzesBySkill,
  getQuizById,
} = require('../controllers/quizController');

const router = express.Router();
router.use(authMiddleware);

router.post('/generate',          generateQuiz);
router.get('/',                   getQuizzes);
router.get('/skill/:skillId',     getQuizzesBySkill);
router.get('/:id',                getQuizById);

module.exports = router;
