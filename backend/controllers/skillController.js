const skillService = require('../services/skillService');

async function createSkill(req, res, next) {
  try {
    const { name, difficultyLevel, subSkills } = req.body;
    if (!name || !difficultyLevel) {
      return res.status(400).json({ message: 'Skill name and difficulty level are required' });
    }
    const skill = await skillService.createSkill({
      name, difficultyLevel, subSkills, createdBy: req.user._id,
    });
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
}

async function getSkills(req, res, next) {
  try {
    // FR-6: support search and filter by difficulty via query params
    const { search, difficulty } = req.query;
    const skills = await skillService.getSkillsByUser(req.user._id, { search, difficulty });
    res.json(skills);
  } catch (err) {
    next(err);
  }
}

async function getSkillById(req, res, next) {
  try {
    const skill = await skillService.getSkillById(req.params.id, req.user._id);
    res.json(skill);
  } catch (err) {
    next(err);
  }
}

async function updateSkill(req, res, next) {
  try {
    const skill = await skillService.updateSkill(req.params.id, req.user._id, req.body);
    res.json(skill);
  } catch (err) {
    next(err);
  }
}

async function deleteSkill(req, res, next) {
  try {
    await skillService.deleteSkill(req.params.id, req.user._id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSkill, getSkills, getSkillById, updateSkill, deleteSkill };
