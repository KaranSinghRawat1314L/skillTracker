const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    subSkills:       [{ type: String, trim: true }],
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// A user cannot have two skills with the same name
skillSchema.index({ createdBy: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Skill', skillSchema);
