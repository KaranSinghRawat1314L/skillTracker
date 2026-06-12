import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Brain, Menu, X, LogOut, ChevronDown, Pencil, Upload, User } from 'lucide-react';
import { useAuth, notifyAuthChange } from '../hooks/useAuth';
import { Avatar, Spinner } from './UI';
import api from '../utils/api';

const NAV_LINKS = [
  { to: '/dashboard',   label: 'Dashboard' },
  { to: '/skilladd',    label: 'Add Skill' },
  { to: '/ai-quizzes',  label: 'AI Quizzes' },
  { to: '/performance', label: 'Performance' },
];

function ProfileMenu({ user, onLogout, onUserUpdate }) {
  const [open, setOpen]           = useState(false);
  const [editingName, setEditing] = useState(false);
  const [newName, setNewName]     = useState(user.name);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const ref     = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setEditing(false);
        setNewName(user.name);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [user.name]);

  async function saveName() {
    if (!newName.trim() || newName.trim() === user.name) { setEditing(false); return; }
    setSaving(true);
    try {
      await api.put('/users/me', { name: newName.trim() });
      await onUserUpdate();
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  }

  async function uploadPic(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePic', file);
    setUploading(true);
    try {
      await api.post('/users/profile-pic', formData);
      await onUserUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-100 transition"
      >
        <Avatar name={user.name} profilePicId={user.profilePicId} size="sm" />
        <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 card shadow-xl p-4 z-50 animate-slide-up">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative group mb-3">
              <Avatar name={user.name} profilePicId={user.profilePicId} size="lg" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                           flex items-center justify-center transition"
              >
                {uploading ? <Spinner className="w-5 h-5 text-white" /> : <Upload className="w-5 h-5 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPic} />
            </div>

            {/* Editable name */}
            {editingName ? (
              <div className="flex gap-2 w-full">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="input text-sm py-1.5"
                  autoFocus
                />
                <button onClick={saveName} disabled={saving} className="btn-primary py-1.5 px-3 text-sm">
                  {saving ? <Spinner className="w-4 h-4" /> : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>

          <hr className="border-surface-200 mb-3" />

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm
                       text-slate-600 hover:bg-surface-100 transition mb-1"
          >
            <User className="w-4 h-4" /> View Profile
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm
                       text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, loading, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-brand-50 text-brand-600'
        : 'text-slate-600 hover:text-brand-600 hover:bg-surface-100'
    }`;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md transition-shadow duration-200
                     ${scrolled ? 'shadow-sm border-b border-surface-200' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl
                            flex items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">SkillTracker</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={linkClass}>{label}</NavLink>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {loading ? (
              <Spinner />
            ) : user ? (
              <>
                <ProfileMenu user={user} onLogout={handleLogout} onUserUpdate={fetchUser} />
                <button
                  className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-surface-100"
                  onClick={() => setMobileOpen(v => !v)}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"  className="btn-ghost  py-2 px-4 text-sm">Log In</Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && user && (
        <div className="md:hidden border-t border-surface-200 bg-white animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to} to={to} className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
