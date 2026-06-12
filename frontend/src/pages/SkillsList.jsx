import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Target, ChevronRight, SlidersHorizontal } from 'lucide-react';
import api from '../utils/api';
import { PageLoader, DifficultyBadge, EmptyState } from '../components/UI';

const DIFFICULTIES = ['', 'Beginner', 'Intermediate', 'Advanced'];

export default function SkillsList() {
  const [skills,     setSkills]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)     params.search     = search;
      if (difficulty) params.difficulty = difficulty;
      const { data } = await api.get('/skills', { params });
      setSkills(data);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [search, difficulty]);

  useEffect(() => {
    const debounce = setTimeout(fetchSkills, 300);
    return () => clearTimeout(debounce);
  }, [fetchSkills]);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Skills</h1>
        <Link to="/skilladd" className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" /> Add Skill
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills…"
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="input pl-10 pr-8 sm:w-44 appearance-none"
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d || 'All Levels'}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : skills.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title={search || difficulty ? 'No skills match your filters' : 'No skills yet'}
            description={search || difficulty ? 'Try a different search or filter' : 'Add your first skill to get started'}
            action={
              !search && !difficulty && (
                <Link to="/skilladd" className="btn-primary text-sm">
                  <Plus className="w-4 h-4" /> Add your first skill
                </Link>
              )
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
              <div className="flex items-center gap-1 mt-3 text-xs text-brand-500 font-medium
                              opacity-0 group-hover:opacity-100 transition">
                View details <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
