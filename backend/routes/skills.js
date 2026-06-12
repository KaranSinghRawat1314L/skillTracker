const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');

const router = express.Router();
router.use(authMiddleware);

router.get('/',     getSkills);      // ?search=&difficulty=
router.post('/',    createSkill);
router.get('/:id',  getSkillById);
router.put('/:id',  updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router;
