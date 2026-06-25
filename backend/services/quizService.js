const axios = require('axios');
const Quiz = require('../models/Quiz');
const Skill = require('../models/Skill');

// ── Groq config ────────────────────────────────────────────────────────────
// Groq serves Meta's Llama models with an OpenAI-compatible API.
// Free tier: generous per-minute + per-day limits, no credit card needed.
// Get your key at: https://console.groq.com/keys
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Calls Groq with automatic retry on 429 (rate limit) / 503 (overloaded).
 * Exponential backoff: 1s, 2s, 4s.
 */
async function callGroqWithRetry(payload, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios.post(GROQ_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      });
    } catch (err) {
      const status = err.response?.status;
      const isRetryable = status === 429 || status === 503;

      if (!isRetryable || attempt === maxRetries) throw err;

      const waitMs = 1000 * Math.pow(2, attempt);
      console.warn(`Groq returned ${status}. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }
}

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

  // Groq uses the OpenAI-compatible chat completions format
  const payload = {
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a quiz generator. Always respond with valid JSON only, no markdown formatting.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  };

  let response;
  try {
    response = await callGroqWithRetry(payload);
  } catch (err) {
    console.error('Groq API error:', err.response?.data || err.message);
    const e = new Error('AI quiz generation failed. Please try again later.');
    e.statusCode = 503;
    throw e;
  }

  let raw = response?.data?.choices?.[0]?.message?.content || '';
  // Strip markdown code fences if the model wraps output in them
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Some models wrap the array in an object like { "questions": [...] }
  let questions;
  try {
    const parsed = JSON.parse(raw);
    questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data;
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('Not an array');
  } catch {
    console.error('Groq parse error. Raw output:', raw);
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
