import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SkillsAdd from "./pages/SkillsAdd";
import AIQuizzes from "./pages/AiQuizzes";
import SkillDetail from "./pages/SkillDetail"; // Optional if implemented
import Performance from "./pages/Performance"; // Optional Performance analytics page

// Auth guard for private routes
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="pt-15">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Private routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/skilladd" element={<PrivateRoute><SkillsAdd /></PrivateRoute>} />
          <Route path="/ai-quizzes" element={<PrivateRoute><AIQuizzes /></PrivateRoute>} />
          <Route path="/skills/:id" element={<PrivateRoute><SkillDetail /></PrivateRoute>} />
          <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />

          {/* Fallback 404 to dashboard or login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
