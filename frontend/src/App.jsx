import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Navbar      from './components/Navbar';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import SkillsList  from './pages/SkillsList';
import SkillsAdd   from './pages/SkillsAdd';
import SkillDetail from './pages/SkillDetail';
import AIQuizzes   from './pages/AiQuizzes';
import Performance from './pages/Performance';
import Profile     from './pages/Profile';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  return localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <Navbar />
        {/* pt-16 offsets the fixed 64px navbar */}
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public */}
            <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Private */}
            <Route path="/dashboard"   element={<PrivateRoute><Dashboard   /></PrivateRoute>} />
            <Route path="/skills"      element={<PrivateRoute><SkillsList  /></PrivateRoute>} />
            <Route path="/skilladd"    element={<PrivateRoute><SkillsAdd   /></PrivateRoute>} />
            <Route path="/skills/:id"  element={<PrivateRoute><SkillDetail /></PrivateRoute>} />
            <Route path="/ai-quizzes"  element={<PrivateRoute><AIQuizzes   /></PrivateRoute>} />
            <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
            <Route path="/profile"     element={<PrivateRoute><Profile     /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
