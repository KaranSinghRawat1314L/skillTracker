import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, TrendingUp, ChevronRight, Target } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { PageLoader, StatCard, DifficultyBadge, EmptyState } from '../components/UI';

function QuickAction({ to, icon: Icon, label, description, gradient }) {
  return (
    <Link to={to} className="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow group">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient}
                       flex items-center justify-center shrink-0 shadow-sm
                       group-hover:scale-110 transition-transform duration-150`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 self-center shrink-0
                               group-hover:translate-x-1 transition-transform duration-150" />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [skills,  setSkills]  = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/skills'), api.get('/results/me')])
      .then(([s, r]) => { setSkills(s.data); setResults(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const total     = results.length;
  const avgScore  = total
    ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / total)
    : 0;
  const bestScore = total ? Math.max(...results.map(r => r.percentage || 0)) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {greeting}, <span className="text-brand-600">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Here's a snapshot of your learning progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Skills Tracked" value={skills.length}  color="brand"  />
        <StatCard label="Quizzes Taken"  value={total}          color="orange" />
        <StatCard label="Average Score"  value={`${avgScore}%`} color="green"  />
        <StatCard label="Best Score"     value={total ? `${bestScore}%` : '—'} color="brand" />
      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <QuickAction to="/skilladd"    icon={Plus}       label="Add New Skill"     description="Track a new topic you're learning"         gradient="from-emerald-400 to-emerald-600" />
        <QuickAction to="/ai-quizzes"  icon={Sparkles}   label="Take AI Quiz"      description="Generate and attempt a smart quiz"          gradient="from-brand-500 to-brand-700" />
        <QuickAction to="/performance" icon={TrendingUp} label="View Performance"  description="Analyse your quiz history and score trends" gradient="from-accent-400 to-accent-600" />
      </div>

      {/* Skills grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Your Skills</h2>
        <Link to="/skilladd" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add skill
        </Link>
      </div>

      {skills.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="No skills yet"
            description="Add your first skill to start taking AI-powered quizzes"
            action={
              <Link to="/skilladd" className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Add your first skill
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map(skill => (
            <Link
              key={skill._id}
              to={`/skills/${skill._id}`}
              className="card p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center
                                group-hover:bg-brand-100 transition-colors">
                  <Target className="w-5 h-5 text-brand-500" />
                </div>
                <DifficultyBadge level={skill.difficultyLevel} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">
                {skill.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {skill.subSkills?.length > 0 ? skill.subSkills.join(' · ') : 'No subskills listed'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
