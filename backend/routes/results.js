const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { evaluateQuiz, getMyResults, getResultByQuiz } = require('../controllers/resultController');

const router = express.Router();
router.use(authMiddleware);

router.post('/evaluate',          evaluateQuiz);
router.get('/me',                 getMyResults);
router.get('/quiz/:quizId',       getResultByQuiz);

module.exports = router;
