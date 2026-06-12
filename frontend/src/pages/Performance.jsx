import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { PageLoader, Alert, StatCard, DifficultyBadge, EmptyState } from '../components/UI';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-slate-700 mb-0.5">{label}</p>
      <p className="text-brand-600 font-semibold">{payload[0].value}%</p>
    </div>
  );
}

function barColor(pct) {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return '#3574f0';
  return '#f97316';
}

export default function Performance() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/results/me')
      .then(r => setResults(r.data))
      .catch(() => setError('Failed to load performance data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const total    = results.length;
  const avgPct   = total ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / total) : 0;
  const bestPct  = total ? Math.max(...results.map(r => r.percentage || 0)) : 0;
  const worstPct = total ? Math.min(...results.map(r => r.percentage || 0)) : 0;

  // Last 15 results for the chart
  const chartData = [...results].reverse().slice(-15).map((r, i) => ({
    label: `${r.quizId?.skillId?.name?.substring(0, 8) || 'Quiz'} #${i + 1}`,
    pct:   r.percentage || 0,
    diff:  r.quizId?.difficulty,
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface-100 transition">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Performance</h1>
          <p className="text-slate-500 text-sm">Your quiz history and score trends</p>
        </div>
      </div>

      {error && <div className="mb-6"><Alert type="error">{error}</Alert></div>}

      {total === 0 ? (
        <div className="card">
          <EmptyState
            icon={TrendingUp}
            title="No quiz results yet"
            description="Take your first AI quiz to see performance analytics here"
            action={<Link to="/ai-quizzes" className="btn-primary text-sm">Take a Quiz</Link>}
          />
        </div>
      ) : (
        <>
          {/* FR-12: Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Quizzes"  value={total}          color="brand"  />
            <StatCard label="Average Score"  value={`${avgPct}%`}   color="orange" />
            <StatCard label="Highest Score"  value={`${bestPct}%`}  color="green"  />
            <StatCard label="Lowest Score"   value={`${worstPct}%`} color="red"    />
          </div>

          {/* FR-13: Bar chart */}
          <div className="card p-6 mb-8">
            <h2 className="text-base font-semibold text-slate-700 mb-1">Score Trend</h2>
            <p className="text-xs text-slate-400 mb-5">Last {chartData.length} quiz attempts</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 55 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  height={65}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.pct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />≥ 80%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-500 inline-block" />60 – 79%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-accent-500 inline-block" />&lt; 60%</span>
            </div>
          </div>

          {/* FR-11: Quiz history table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100">
              <h2 className="text-base font-semibold text-slate-700">Quiz History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 text-left">
                    {['Skill', 'Difficulty', 'Score', 'Time Taken', 'Date'].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {results.map(r => {
                    const skillName = r.quizId?.skillId?.name || '—';
                    const mins      = Math.floor((r.timeTaken || 0) / 60);
                    const secs      = (r.timeTaken || 0) % 60;
                    const pctColor  =
                      r.percentage >= 80 ? 'text-green-600' :
                      r.percentage >= 60 ? 'text-brand-600' : 'text-amber-600';

                    return (
                      <tr key={r._id} className="hover:bg-surface-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{skillName}</td>
                        <td className="px-6 py-4">
                          <DifficultyBadge level={r.quizId?.difficulty || '—'} />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${pctColor}`}>
                            {r.score}/{r.quizId?.questions?.length || 5} ({r.percentage}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {r.timeTaken ? `${mins}m ${secs}s` : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
