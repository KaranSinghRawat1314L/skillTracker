import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Phone, Mail, Check } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Avatar, Alert, Spinner, PageLoader } from '../components/UI';

export default function Profile() {
  const { user, loading: authLoading, fetchUser } = useAuth();

  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef();

  const [form, setForm] = useState({
    mobile: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '',
  });

  // Sync form when user data loads
  useEffect(() => {
    if (user) {
      setForm({
        mobile:     user.mobile            || '',
        line1:      user.address?.line1    || '',
        line2:      user.address?.line2    || '',
        city:       user.address?.city     || '',
        state:      user.address?.state    || '',
        postalCode: user.address?.postalCode || '',
        country:    user.address?.country  || '',
      });
    }
  }, [user]);

  if (authLoading) return <PageLoader />;
  if (!user) return null;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/users/address', form);
      await fetchUser();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  }

  // FR-14: upload profile pic to GridFS via backend
  async function handlePicUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      await api.post('/users/profile-pic', formData);
      await fetchUser();            // re-fetch so profilePicId is updated everywhere
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  }

  const hasAddress = user.address?.line1 || user.address?.city;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface-100 transition">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      </div>

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
      {saved  && (
        <div className="mb-4">
          <Alert type="success"><Check className="w-4 h-4" /> Profile updated successfully</Alert>
        </div>
      )}

      {/* Profile card */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          {/* FR-14: avatar — click to upload, stored in GridFS */}
          <div className="relative group shrink-0">
            <Avatar name={user.name} profilePicId={user.profilePicId} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
                         flex items-center justify-center transition"
              title="Change photo"
            >
              {uploading
                ? <Spinner className="w-6 h-6 text-white" />
                : <Camera  className="w-6 h-6 text-white" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handlePicUpload}
            />
          </div>

          {/* User info */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{user.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </div>
            {user.mobile && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                <Phone className="w-3.5 h-3.5" /> {user.mobile}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">Hover avatar to change photo</p>
          </div>
        </div>
      </div>

      {/* Address card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <h2 className="font-semibold text-slate-800">Address</h2>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-sm">
              {hasAddress ? 'Edit' : 'Add Address'}
            </button>
          )}
        </div>

        {!editing ? (
          hasAddress ? (
            <div className="text-sm text-slate-600 space-y-1 leading-relaxed">
              {user.address?.line1    && <p>{user.address.line1}</p>}
              {user.address?.line2    && <p>{user.address.line2}</p>}
              {(user.address?.city || user.address?.state) && (
                <p>{[user.address.city, user.address.state].filter(Boolean).join(', ')}</p>
              )}
              {(user.address?.postalCode || user.address?.country) && (
                <p>{[user.address.postalCode, user.address.country].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No address saved yet.</p>
          )
        ) : (
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="label flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} className="input" placeholder="+91 98765 43210" type="tel" />
            </div>
            <div>
              <label className="label">Street Address</label>
              <input name="line1" value={form.line1} onChange={handleChange} required className="input" placeholder="Street address" />
            </div>
            <div>
              <label className="label">Apt / Suite <span className="text-slate-400 font-normal">(optional)</span></label>
              <input name="line2" value={form.line2} onChange={handleChange} className="input" placeholder="Apt, Suite, Floor…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input name="city" value={form.city} onChange={handleChange} required className="input" placeholder="City" />
              </div>
              <div>
                <label className="label">State</label>
                <input name="state" value={form.state} onChange={handleChange} required className="input" placeholder="State" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Postal Code</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} required className="input" placeholder="110001" />
              </div>
              <div>
                <label className="label">Country</label>
                <input name="country" value={form.country} onChange={handleChange} required className="input" placeholder="India" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setEditing(false); setError(''); }}
                disabled={saving}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <Spinner className="w-4 h-4" /> : <><Check className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
