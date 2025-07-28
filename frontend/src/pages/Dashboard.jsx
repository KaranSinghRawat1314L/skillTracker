// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);

  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch saved skills
  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/skills", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setSkills(res.data))
      .catch(() => setSkills([]))
      .finally(() => setLoadingSkills(false));
  }, [token]);

  // Fetch quiz results (performance)
  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/results/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setResults(res.data))
      .catch(() => {
        setResults([]);
        setError("Failed to load performance data.");
      })
      .finally(() => setLoadingResults(false));
  }, [token]);

  // Calculate performance stats: raw score counts, not percentages
  const totalQuizzes = results.length;
  const averageScore = totalQuizzes
    ? Math.round(results.reduce((acc, r) => acc + (r.score || 0), 0) / totalQuizzes)
    : 0;
  const bestScore = totalQuizzes ? Math.max(...results.map((r) => r.score || 0)) : 0;
  const worstScore = totalQuizzes ? Math.min(...results.map((r) => r.score || 0)) : 0;

  return (
    <main className="min-h-screen bg-blue-50 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-10 text-center md:text-left">
        Dashboard
      </h1>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-12">
        {/* Skills Progress */}
        <section className="flex flex-col justify-between bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Skills Progress</h2>
            <p className="text-gray-700">Track your skill improvement over time.</p>
          </div>
          <Link
            to="/skilladd"
            className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition text-center"
          >
            Add Skills
          </Link>
        </section>

        {/* AI Quizzes */}
        <section className="flex flex-col justify-between bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-3">AI Quizzes</h2>
            <p className="text-gray-700">Generate and take AI-powered quizzes tailored to your skills.</p>
          </div>
          <Link
            to="/ai-quizzes"
            className="mt-6 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition text-center"
          >
            Take Quiz
          </Link>
        </section>

        {/* Performance */}
        <section className="flex flex-col justify-between bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
          <div>
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Performance</h2>
            {loadingResults ? (
              <p className="text-blue-500">Loading performance data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : totalQuizzes === 0 ? (
              <p className="italic text-gray-500">No quiz results yet.</p>
            ) : (
              <div className="text-gray-700 space-y-1">
                <p><strong>Total Quizzes Taken:</strong> {totalQuizzes}</p>
                <p><strong>Average Correct Answers:</strong> {averageScore}</p>
                <p><strong>Best Score:</strong> {bestScore}</p>
                <p><strong>Worst Score:</strong> {worstScore}</p>
              </div>
            )}
          </div>
          <Link
            to="/performance"
            className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded transition text-center"
          >
            View Details
          </Link>
        </section>
      </div>

      {/* Saved Skills */}
      <section className="max-w-7xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Your Saved Skills</h2>
        {loadingSkills ? (
          <p className="text-blue-500">Loading your skills...</p>
        ) : skills.length === 0 ? (
          <p className="italic text-gray-500">No skills added yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <li key={skill.skillId}>
                <Link
                  to={`/skills/${skill.skillId}`}
                  className="block p-5 bg-blue-50 border border-blue-200 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">{skill.name}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-2">{skill.difficultyLevel}</p>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    {skill.subSkills && skill.subSkills.length > 0
                      ? skill.subSkills.join(", ")
                      : "No subskills listed"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
