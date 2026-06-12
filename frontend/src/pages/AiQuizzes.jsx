import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, ChevronRight, ChevronLeft, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { Alert, Spinner, DifficultyBadge, EmptyState } from '../components/UI';

// ── Quiz Setup ────────────────────────────────────────────────────────────────
function QuizSetup({ skills, onGenerate, loading }) {
  const location = useLocation();
  const [skillId,    setSkillId]    = useState(location.state?.preselectedSkillId || '');
  const [difficulty, setDifficulty] = useState('Easy');
  const [error,      setError]      = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!skillId) { setError('Please select a skill'); return; }
    setError('');
    onGenerate({ skillId, difficulty });
  }

  return (
    <div className="card p-6 max-w-lg mx-auto animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl
                        flex items-center justify-center shadow-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">Generate AI Quiz</h2>
          <p className="text-xs text-slate-500">5 questions tailored to your skill</p>
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Select Skill</label>
          <select value={skillId} onChange={e => setSkillId(e.target.value)} className="input" required>
            <option value="">Choose a skill…</option>
            {skills.map(s => (
              <option key={s._id} value={s._id}>{s.name} — {s.difficultyLevel}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Quiz Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Medium', 'Hard'].map(d => (
              <button key={d} type="button" onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                            ${difficulty === d
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-surface-200 text-slate-600 hover:border-brand-200'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading
            ? <><Spinner className="w-4 h-4" /> Generating…</>
            : <>Generate Quiz <ChevronRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}

// ── Timer hook ────────────────────────────────────────────────────────────────
function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);

  function start() {
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }
  function stop() {
    clearInterval(ref.current);
  }
  useEffect(() => () => clearInterval(ref.current), []);

  const fmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  return { elapsed, fmt, start, stop };
}

// ── Quiz Attempt — ONE question at a time (FR-9) ──────────────────────────────
function QuizAttempt({ quiz, onSubmit, loading }) {
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState(Array(quiz.questions.length).fill(''));
  const [error,    setError]    = useState('');
  const { elapsed, fmt, start, stop } = useTimer();

  useEffect(() => { start(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const q        = quiz.questions[current];
  const total    = quiz.questions.length;
  const progress = ((current + 1) / total) * 100;

  function selectAnswer(opt) {
    const next = [...answers];
    next[current] = opt;
    setAnswers(next);
    setError('');
  }

  function goNext() {
    if (!answers[current]) { setError('Please select an answer before continuing'); return; }
    setError('');
    if (current < total - 1) { setCurrent(c => c + 1); }
  }

  function goPrev() {
    if (current > 0) { setCurrent(c => c - 1); setError(''); }
  }

  function handleSubmit() {
    if (!answers[current]) { setError('Please select an answer before submitting'); return; }
    stop();
    onSubmit(answers, elapsed);
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Header: progress + timer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DifficultyBadge level={quiz.difficulty} />
          <span className="text-sm text-slate-500">
            Question <span className="font-semibold text-slate-700">{current + 1}</span> of {total}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-mono">
          <Clock className="w-4 h-4" /> {fmt}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="card p-6 mb-4 animate-fade-in" key={current}>
        <p className="text-base font-semibold text-slate-800 leading-relaxed mb-5">{q.prompt}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectAnswer(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-150
                          ${answers[current] === opt
                            ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                            : 'border-surface-200 text-slate-700 hover:border-brand-300 hover:bg-surface-50'}`}
            >
              <span className="inline-flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                                  ${answers[current] === opt
                                    ? 'border-brand-500 bg-brand-500 text-white'
                                    : 'border-slate-300 text-slate-400'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={goPrev} disabled={current === 0} className="btn-ghost py-3 px-5">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {current < total - 1 ? (
          <button onClick={goNext} className="btn-primary flex-1 py-3">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? <><Spinner className="w-4 h-4" /> Evaluating…</> : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Answered dots */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {answers.map((a, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-brand-500 w-5' : a ? 'bg-brand-300' : 'bg-surface-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Quiz Result (FR-10) ───────────────────────────────────────────────────────
function QuizResult({ result, quiz, onRetake }) {
  const pct    = result.percentage;
  const isGood = pct >= 60;

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Score */}
      <div className={`card p-8 text-center mb-5 ${isGood ? 'border-green-200' : 'border-amber-200'}`}>
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold
                         ${isGood ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {pct}%
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : 'Keep practicing!'}
        </h2>
        <p className="text-slate-500 text-sm">
          You scored <strong>{result.score}</strong> out of <strong>{quiz.questions.length}</strong>
        </p>
      </div>

      {/* AI Feedback */}
      {result.aiFeedback && (
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-slate-800 text-sm">AI Feedback</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{result.aiFeedback}</p>
        </div>
      )}

      {/* Per-question review */}
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-slate-800 mb-4">Question Review</h3>
        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const correct = result.userAnswers[i] === q.answer;
            return (
              <div key={i} className={`p-4 rounded-xl border ${correct ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {correct
                    ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    : <XCircle    className="w-4 h-4 text-red-500   mt-0.5 shrink-0" />}
                  <p className="text-sm font-medium text-slate-700">{q.prompt}</p>
                </div>
                {!correct && (
                  <div className="pl-6 space-y-0.5 text-xs">
                    <p className="text-red-600">Your answer: {result.userAnswers[i] || '(none)'}</p>
                    <p className="text-green-700 font-medium">Correct: {q.answer}</p>
                  </div>
                )}
                {q.explanation && (
                  <p className="pl-6 text-xs text-slate-500 mt-1 italic">{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={onRetake} className="btn-ghost w-full py-3">
        <RotateCcw className="w-4 h-4" /> Take Another Quiz
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AIQuizzes() {
  const [skills,       setSkills]       = useState([]);
  const [quiz,         setQuiz]         = useState(null);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [loadingSkills,setLoadingSkills]= useState(true);

  useEffect(() => {
    api.get('/skills')
      .then(r => setSkills(r.data))
      .catch(() => {})
      .finally(() => setLoadingSkills(false));
  }, []);

  async function handleGenerate({ skillId, difficulty }) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/quizzes/generate', { skillId, difficulty });
      setQuiz(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(userAnswers, timeTaken) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/results/evaluate', {
        quizId: quiz._id,
        userAnswers,
        timeTaken,
      });
      setResult({ ...data, userAnswers });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate quiz.');
    } finally {
      setLoading(false);
    }
  }

  function reset() { setQuiz(null); setResult(null); setError(''); }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">AI Quizzes</h1>
        <p className="text-slate-500 text-sm mt-1">Generate smart quizzes powered by Gemini AI</p>
      </div>

      {error && <div className="mb-6 max-w-lg mx-auto"><Alert type="error">{error}</Alert></div>}

      {loadingSkills ? (
        <div className="flex justify-center py-20"><Spinner className="w-8 h-8" /></div>
      ) : skills.length === 0 ? (
        <div className="card max-w-lg mx-auto">
          <EmptyState
            icon={Sparkles}
            title="No skills to quiz on"
            description="Add at least one skill before generating a quiz"
            action={<Link to="/skilladd" className="btn-primary text-sm">Add your first skill</Link>}
          />
        </div>
      ) : !quiz ? (
        <QuizSetup skills={skills} onGenerate={handleGenerate} loading={loading} />
      ) : !result ? (
        <QuizAttempt quiz={quiz} onSubmit={handleSubmit} loading={loading} />
      ) : (
        <QuizResult result={result} quiz={quiz} onRetake={reset} />
      )}
    </main>
  );
}
