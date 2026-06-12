const axios = require('axios');
const Quiz = require('../models/Quiz');
const Skill = require('../models/Skill');

const GEMINI_URL =
  process.env.GEMINI_API_URL ||
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

async function generateQuiz({ skillId, difficulty, userId }) {
  const skill = await Skill.findOne({ _id: skillId, createdBy: userId });
  if (!skill) {
    const err = new Error('Skill not found');
    err.statusCode = 404;
    throw err;
  }

  const subSkillsText =
    skill.subSkills.length > 0 ? skill.subSkills.join(', ') : 'general concepts';

  const prompt = `Generate exactly 5 ${difficulty} level multiple-choice questions about "${skill.name}".
Cover these subskills: ${subSkillsText}.

Return ONLY a raw JSON array with no markdown, no code fences, no explanation.
Each element must have exactly these fields:
{
  "prompt": "The question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "Option A",
  "explanation": "Brief reason why this is correct."
}`;

  const response = await axios.post(
    GEMINI_URL,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
    }
  );

  let raw = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // Strip markdown code fences if Gemini wraps output in them
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let questions;
  try {
    questions = JSON.parse(raw);
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('Not an array');
  } catch {
    const err = new Error('AI returned an unexpected format. Please try again.');
    err.statusCode = 502;
    throw err;
  }

  // Validate structure of each question
  for (const q of questions) {
    if (!q.prompt || !Array.isArray(q.options) || q.options.length < 2 || !q.answer) {
      const err = new Error('AI questions are malformed. Please try again.');
      err.statusCode = 502;
      throw err;
    }
  }

  return Quiz.create({ skillId: skill._id, createdBy: userId, difficulty, questions });
}

async function getQuizzesByUser(userId) {
  return Quiz.find({ createdBy: userId })
    .populate('skillId', 'name difficultyLevel')
    .sort({ createdAt: -1 });
}

async function getQuizzesBySkill(skillId, userId) {
  return Quiz.find({ skillId, createdBy: userId }).sort({ createdAt: -1 });
}

async function getQuizById(quizId, userId) {
  const quiz = await Quiz.findOne({ _id: quizId, createdBy: userId });
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.statusCode = 404;
    throw err;
  }
  return quiz;
}

module.exports = { generateQuiz, getQuizzesByUser, getQuizzesBySkill, getQuizById };
