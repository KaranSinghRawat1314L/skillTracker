import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SkillsAdd() {
  const [step, setStep] = useState(1);
  const [skillName, setSkillName] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  const [subSkillsText, setSubSkillsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleNext = () => {
    setError(null);
    if (!skillName.trim()) {
      setError('Skill name is required');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const subSkillsArray = subSkillsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const { data } = await axios.post(
        '/api/skills',
        {
          name: skillName.trim(),
          difficultyLevel,
          subSkills: subSkillsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/ai-quizzes', { state: { preselectedSkill: data.name } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Add New Skill</h1>
      {error && <div className="mb-4 p-3 bg-rose-100 text-rose-700 border border-rose-300 rounded">{error}</div>}

      {step === 1 && (
        <>
          <div className="mb-4">
            <label htmlFor="skillName" className="block mb-1 font-semibold text-gray-700">Skill Name</label>
            <input
              id="skillName"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              required
              placeholder="e.g. JavaScript"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="difficultyLevel" className="block mb-1 font-semibold text-gray-700">Difficulty Level</label>
            <select
              id="difficultyLevel"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="subSkills" className="block mb-1 font-semibold text-gray-700">Sub Skills (comma separated)</label>
            <input
              id="subSkills"
              type="text"
              value={subSkillsText}
              onChange={(e) => setSubSkillsText(e.target.value)}
              placeholder="e.g. Variables, Functions, Loops"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-300"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold transition disabled:opacity-50"
            disabled={loading}
            type="button"
          >
            Next: Confirm & Save
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Skill Details</h2>
          <ul className="mb-6 space-y-2 text-gray-700">
            <li><strong>Name:</strong> {skillName}</li>
            <li><strong>Difficulty Level:</strong> {difficultyLevel}</li>
            <li><strong>Sub Skills:</strong> {subSkillsText ? subSkillsText.split(',').map(s => s.trim()).filter(Boolean).join(', ') : 'None'}</li>
          </ul>
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="px-6 py-2 rounded border border-gray-400 hover:bg-gray-100 font-semibold"
              disabled={loading}
              type="button"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold transition disabled:opacity-50"
              disabled={loading}
              type="button"
            >
              {loading ? 'Saving...' : 'Save Skill & Go to AI Quiz'}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
