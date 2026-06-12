const Skill = require('../models/Skill');

async function createSkill({ name, difficultyLevel, subSkills, createdBy }) {
  try {
    return await Skill.create({
      name: name.trim(),
      difficultyLevel,
      subSkills: Array.isArray(subSkills) ? subSkills.filter(Boolean) : [],
      createdBy,
    });
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error(`You already have a skill named "${name}"`);
      e.statusCode = 400;
      throw e;
    }
    throw err;
  }
}

async function getSkillsByUser(userId, { search, difficulty } = {}) {
  const query = { createdBy: userId };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (difficulty) {
    query.difficultyLevel = difficulty;
  }

  return Skill.find(query).sort({ createdAt: -1 });
}

async function getSkillById(skillId, userId) {
  const skill = await Skill.findOne({ _id: skillId, createdBy: userId });
  if (!skill) {
    const err = new Error('Skill not found');
    err.statusCode = 404;
    throw err;
  }
  return skill;
}

async function updateSkill(skillId, userId, updateData) {
  const skill = await Skill.findOneAndUpdate(
    { _id: skillId, createdBy: userId },
    updateData,
    { new: true, runValidators: true }
  );
  if (!skill) {
    const err = new Error('Skill not found');
    err.statusCode = 404;
    throw err;
  }
  return skill;
}

async function deleteSkill(skillId, userId) {
  const skill = await Skill.findOneAndDelete({ _id: skillId, createdBy: userId });
  if (!skill) {
    const err = new Error('Skill not found');
    err.statusCode = 404;
    throw err;
  }
}

module.exports = { createSkill, getSkillsByUser, getSkillById, updateSkill, deleteSkill };
