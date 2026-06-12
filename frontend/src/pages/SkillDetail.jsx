import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Calendar, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Plus,
} from 'lucide-react';
import api from '../utils/api';
import { PageLoader, Alert, DifficultyBadge, EmptyState } from '../components/UI';

export default function SkillDetail() {
  const { id } = useParams();
  const [skill,    setSkill]    = useState(null);
  const [quizzes,  setQuizzes]  = useState([]);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [skillRes, quizzesRes, resultsRes] = await Promise.all([
          api.get(`/skills/${id}`),
          api.get(`/quizzes/skill/${id}`),
          api.get('/results/me'),
        ]);
        setSkill(skillRes.data);
        setQuizzes(quizzesRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Skill not found.' : 'Failed to load skill details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Alert type="error">{error}</Alert>
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-brand-600 mt-4 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </main>
    );
  }

  function getResult(quizId) {
    return results.find(r => {
      const rId = typeof r.quizId === 'object' ? r.quizId?._id : r.quizId;
      return String(rId) === String(quizId);
    });
  }

  const attempted  = quizzes.filter(q => getResult(q._id)).length;
  const avgScore   = attempted
    ? Math.round(
        quizzes
          .filter(q => getResult(q._id))
          .reduce((a, q) => a + (getResult(q._id)?.percentage || 0), 0) / attempted
      )
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      {/* Skill header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">{skill.name}</h1>
              <DifficultyBadge level={skill.difficultyLevel} />
            </div>
            {skill.subSkills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {skill.subSkills.map(s => (
                  <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Added {new Date(skill.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Inline performance summary for this skill */}
        {attempted > 0 && (
          <div className="mt-5 pt-5 border-t border-surface-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-600">{quizzes.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Quizzes Generated</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{attempted}</p>
              <p className="text-xs text-slate-500 mt-0.5">Attempted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-500">{avgScore}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Avg. Score</p>
            </div>
          </div>
        )}
      </div>

      {/* Quiz history */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-700">Quiz History</h2>
        <Link
          to="/ai-quizzes"
          state={{ preselectedSkillId: id }}
          className="btn-primary text-sm py-2"
        >
          <Plus className="w-4 h-4" /> New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No quizzes yet"
            description="Generate an AI quiz for this skill to start practising"
            action={
              <Link
                to="/ai-quizzes"
                state={{ preselectedSkillId: id }}
                className="btn-primary text-sm"
              >
                Generate Quiz
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => {
            const result    = getResult(quiz._id);
            const pct       = result?.percentage ?? null;
            const isOpen    = expanded === quiz._id;
            const pctColor  =
              pct === null     ? '' :
              pct >= 80        ? 'text-green-600' :
              pct >= 60        ? 'text-brand-600' : 'text-amber-600';

            return (
              <div key={quiz._id} className="card overflow-hidden">
                {/* Row header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-50 transition"
                  onClick={() => setExpanded(isOpen ? null : quiz._id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <DifficultyBadge level={quiz.difficulty} />
                    <span className="text-xs text-slate-400">
                      {new Date(quiz.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {pct !== null ? (
                      <span className={`text-sm font-semibold ${pctColor}`}>
                        {result.score}/{quiz.questions.length} ({pct}%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not attempted</span>
                    )}
                  </div>
                  {isOpen
                    ? <ChevronUp   className="w-4 h-4 text-slate-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </div>

                {/* Expanded question list */}
                {isOpen && (
                  <div className="border-t border-surface-100 px-5 py-4 animate-fade-in">
                    <ol className="space-y-5">
                      {quiz.questions.map((q, i) => {
                        const userAns = result?.userAnswers?.[i];
                        const correct = userAns === q.answer;

                        return (
                          <li key={i}>
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5">{i + 1}.</span>
                              <p className="text-sm font-medium text-slate-800">{q.prompt}</p>
                            </div>
                            <div className="pl-5 space-y-1.5">
                              {q.options.map(opt => {
                                const isCorrectOpt = opt === q.answer;
                                const isUserOpt    = opt === userAns;
                                return (
                                  <div
                                    key={opt}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                                                ${isCorrectOpt                ? 'bg-green-50 text-green-700 font-medium' :
                                                  isUserOpt && !correct       ? 'bg-red-50 text-red-600'                 :
                                                  'text-slate-500'}`}
                                  >
                                    {isCorrectOpt && (
                                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                    )}
                                    {isUserOpt && !correct && (
                                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    )}
                                    {!isCorrectOpt && !(isUserOpt && !correct) && (
                                      <span className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                    {opt}
                                  </div>
                                );
                              })}
                              {q.explanation && (
                                <p className="pl-5 text-xs text-slate-400 italic mt-1">{q.explanation}</p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
