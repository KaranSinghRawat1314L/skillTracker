import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'w-5 h-5' }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info:    'bg-brand-50 border-brand-200 text-brand-700',
  };
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm ${styles[type]} animate-fade-in`}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && (
        <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function StatCard({ label, value, color = 'brand' }) {
  const gradients = {
    brand:  'from-brand-500 to-brand-700',
    orange: 'from-accent-400 to-accent-600',
    green:  'from-emerald-400 to-emerald-600',
    red:    'from-red-400 to-red-500',
  };
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  );
}

export function DifficultyBadge({ level }) {
  const styles = {
    Beginner:     'bg-green-50 text-green-700',
    Intermediate: 'bg-amber-50 text-amber-700',
    Advanced:     'bg-red-50 text-red-700',
    Easy:         'bg-green-50 text-green-700',
    Medium:       'bg-amber-50 text-amber-700',
    Hard:         'bg-red-50 text-red-700',
  };
  return (
    <span className={`badge ${styles[level] || 'bg-slate-100 text-slate-600'}`}>{level}</span>
  );
}

/**
 * Avatar — if user has a profilePicId, fetch from /api/users/profile-pic/:id
 * Otherwise show initials.
 */
const API_BASE = import.meta.env.VITE_API_URL || '/api';
// strip any trailing slash so we don't accidentally produce "...api//users/..."
const BASE = API_BASE.replace(/\/$/, '');

export function Avatar({ name, profilePicId, size = 'md' }) {
  const sizes = {
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-16 h-16 text-xl',
    xl:  'w-24 h-24 text-3xl',
  };
  const initials = name
    ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // profilePicId can be an ObjectId, an object, or a string depending on what
  // the backend sent — always coerce to string before using in a URL.
  const picId = profilePicId
    ? (typeof profilePicId === 'object' && profilePicId._id ? profilePicId._id : profilePicId)
    : null;

  const src = picId ? `${BASE}/users/profile-pic/${picId}` : null;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        onError={(e) => {
          // Debug aid: if this fires, log the exact URL that failed so you can
          // curl/open it directly and see what's actually being returned.
          console.error('Avatar failed to load:', src);
        }}
      />
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand-400 to-accent-500
                     flex items-center justify-center text-white font-semibold
                     border-2 border-white shadow-sm shrink-0`}>
      {initials}
    </div>
  );
}
