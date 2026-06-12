import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Brain, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { notifyAuthChange } from '../hooks/useAuth';
import { Alert, Spinner } from '../components/UI';

export default function Signup() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      notifyAuthChange();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { token: credentialResponse.credential });
      localStorage.setItem('token', data.token);
      notifyAuthChange();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 to-brand-700
                      flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
          <Brain className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 text-center">Start Learning</h1>
        <p className="text-white/70 text-center max-w-xs leading-relaxed">
          Create your account and take your first AI-powered skill quiz today.
        </p>
        <div className="mt-10 space-y-3 w-full max-w-xs text-sm">
          {['✓ Free to use', '✓ AI-generated quizzes', '✓ Personalised feedback', '✓ Visual performance tracking'].map(f => (
            <p key={f} className="text-white/80 font-medium">{f}</p>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">SkillTracker</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create an account</h2>
          <p className="text-slate-500 text-sm mb-7">Start tracking and improving your skills</p>

          {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  required disabled={loading} placeholder="Your full name" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={loading} placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required disabled={loading}
                  placeholder="Min. 6 characters" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <Spinner className="w-4 h-4" /> : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <hr className="flex-1 border-surface-200" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <hr className="flex-1 border-surface-200" />
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google signup failed')}
            width="100%"
          />

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
