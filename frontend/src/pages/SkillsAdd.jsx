import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, BarChart2, Tag, ChevronRight, Check } from 'lucide-react';
import api from '../utils/api';
import { Alert, Spinner } from '../components/UI';

const DIFFICULTY_OPTIONS = [
  { value: 'Beginner',     description: 'Just starting out',  color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'Intermediate', description: 'Some experience',    color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { value: 'Advanced',     description: 'Deep expertise',     color: 'border-red-300 bg-red-50 text-red-700'       },
];

export default function SkillsAdd() {
  const [step,           setStep]      = useState(1);
  const [skillName,      setSkillName] = useState('');
  const [difficulty,     setDiff]      = useState('Beginner');
  const [subSkillsText,  setSub]       = useState('');
  const [loading,        setLoading]   = useState(false);
  const [error,          setError]     = useState('');
  const navigate = useNavigate();

  const subSkillsList = subSkillsText.split(',').map(s => s.trim()).filter(Boolean);

  function goNext(e) {
    e.preventDefault();
    if (!skillName.trim()) { setError('Please enter a skill name'); return; }
    setError('');
    setStep(2);
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/skills', {
        name: skillName.trim(),
        difficultyLevel: difficulty,
        subSkills: subSkillsList,
      });
      // Navigate to quiz generation with this skill pre-selected
      navigate('/ai-quizzes', { state: { preselectedSkillId: data._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-8">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Add New Skill</h1>
        <p className="text-slate-500 text-sm mt-1">
          {step === 1 ? 'Tell us about the skill you want to track' : 'Review and confirm your details'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map(s => (
          <React.Fragment key={s}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                             ${s <= step ? 'bg-brand-600 text-white' : 'bg-surface-200 text-slate-400'}`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 2 && <div className={`flex-1 h-0.5 rounded ${s < step ? 'bg-brand-600' : 'bg-surface-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

      {step === 1 && (
        <form onSubmit={goNext} className="card p-6 space-y-6 animate-slide-up">
          <div>
            <label className="label flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-400" /> Skill Name
            </label>
            <input type="text" value={skillName} onChange={e => setSkillName(e.target.value)}
              placeholder="e.g. Python, React, System Design…" className="input" required autoFocus />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-slate-400" /> Your Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_OPTIONS.map(({ value, description, color }) => (
                <button key={value} type="button" onClick={() => setDiff(value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all
                              ${difficulty === value ? color : 'border-surface-200 hover:border-surface-300'}`}>
                  <p className="text-sm font-semibold">{value}</p>
                  <p className="text-xs mt-0.5 opacity-70">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-400" /> Subskills
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input type="text" value={subSkillsText} onChange={e => setSub(e.target.value)}
              placeholder="e.g. Variables, Functions, Loops" className="input" />
            {subSkillsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {subSkillsList.map(s => (
                  <span key={s} className="badge bg-brand-50 text-brand-600 border border-brand-100">{s}</span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1.5">Separate multiple subskills with commas</p>
          </div>

          <button type="submit" className="btn-primary w-full py-3">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-semibold text-slate-800 mb-5">Confirm Details</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-4 bg-surface-50 rounded-xl">
              <div><p className="text-xs text-slate-500">Skill</p><p className="font-semibold text-slate-800 mt-0.5">{skillName}</p></div>
              <BookOpen className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex justify-between items-center p-4 bg-surface-50 rounded-xl">
              <div><p className="text-xs text-slate-500">Level</p><p className="font-semibold text-slate-800 mt-0.5">{difficulty}</p></div>
              <BarChart2 className="w-5 h-5 text-slate-300" />
            </div>
            {subSkillsList.length > 0 && (
              <div className="p-4 bg-surface-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Subskills</p>
                <div className="flex flex-wrap gap-1.5">
                  {subSkillsList.map(s => (
                    <span key={s} className="badge bg-brand-50 text-brand-600">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1">
              <ArrowLeft className="w-4 h-4" /> Edit
            </button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? <Spinner className="w-4 h-4" /> : 'Save & Generate Quiz'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
