import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Performance() {
  const [results, setResults] = useState([]);
  const [skillsMap, setSkillsMap] = useState({});
  const [quizzesMap, setQuizzesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  function normalizeSkillId(skillId) {
    if (!skillId) return null;
    try {
      if (typeof skillId === "string") return skillId;
      if (typeof skillId === "number") return String(skillId);
      if (typeof skillId === "object") {
        if (skillId.skillId) return String(skillId.skillId);
        if (skillId._id) return String(skillId._id);
        if (skillId.toString) return String(skillId.toString());
      }
      return String(skillId);
    } catch {
      return null;
    }
  }

  function normalizeQuizId(quizId) {
    if (!quizId) return null;
    try {
      if (typeof quizId === "string") return quizId;
      if (typeof quizId === "number") return String(quizId);
      if (typeof quizId === "object") {
        if (quizId._id) return String(quizId._id);
        if (quizId.toString) return String(quizId.toString());
      }
      return String(quizId);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (!token) {
      setError("No authorization token found.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch skills
        const skillsRes = await axios.get("/api/skills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Build skillsMap: skillId -> skill.name
        const skillNameMap = {};
        skillsRes.data.forEach((skill) => {
          const id = normalizeSkillId(skill.skillId || skill._id);
          if (id) {
            skillNameMap[id] = skill.name;
          }
        });
        setSkillsMap(skillNameMap);

        // Fetch quizzes
        const quizzesRes = await axios.get("/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Build quizzesMap: quizId -> quiz object
        const quizMap = {};
        quizzesRes.data.forEach((quiz) => {
          const qId = normalizeQuizId(quiz._id || quiz.quizId);
          if (qId) {
            quizMap[qId] = quiz;
          }
        });
        setQuizzesMap(quizMap);

        // Fetch results
        const resultsRes = await axios.get("/api/results/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(resultsRes.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load performance data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const totalQuizzes = results.length;
  const MAX_SCORE = 5;

  const totalRawScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
  const totalPercentScore = results.reduce(
    (acc, r) => acc + ((r.score || 0) / MAX_SCORE) * 100,
    0
  );

  const averageRawScore = totalQuizzes
    ? (totalRawScore / totalQuizzes).toFixed(2)
    : 0;
  const averagePercentScore = totalQuizzes
    ? (totalPercentScore / totalQuizzes).toFixed(2)
    : 0;

  const allRawScores = results.map((r) => r.score || 0);
  const bestRawScore = totalQuizzes ? Math.max(...allRawScores) : 0;
  const worstRawScore = totalQuizzes ? Math.min(...allRawScores) : 0;

  const bestPercentScore = totalQuizzes
    ? ((bestRawScore / MAX_SCORE) * 100).toFixed(2)
    : 0;
  const worstPercentScore = totalQuizzes
    ? ((worstRawScore / MAX_SCORE) * 100).toFixed(2)
    : 0;

  // Prepare chart data: each quiz result as separate data point with resolved skill name
  const chartData = results.map((result, index) => {
    const quizId = normalizeQuizId(result.quizId);
    const quiz = quizzesMap[quizId];
    const skillId = quiz?.skillId;
    const skillName =
      skillId && skillsMap[String(skillId)] ? skillsMap[String(skillId)] : "Unknown Skill";

    const percentScore = ((result.score || 0) / MAX_SCORE) * 100;

    return {
      label: `${skillName} #${index + 1}`, // unique label for x-axis
      skillName,
      percentScore: Math.round(percentScore),
      date: result.createdAt || result.date || "",
    };
  });

  return (
    <main className="min-h-screen bg-blue-50 p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Performance Overview</h1>

      {loading && <p className="text-blue-600">Loading performance data...</p>}

      {error && (
        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          <section className="bg-white rounded-lg p-6 shadow border border-gray-200 mb-10 grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            <div>
              <h2 className="text-lg font-semibold text-blue-600">Total Quizzes</h2>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-600">Avg. Correct Answers</h2>
              <p className="text-2xl font-bold">{averageRawScore}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-600">Avg. Percentage Score</h2>
              <p className="text-2xl font-bold">{averagePercentScore}%</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-600">Best / Worst Scores</h2>
              <p className="text-lg font-semibold text-green-600">
                Best: {bestRawScore} ({bestPercentScore}%)
              </p>
              <p className="text-lg font-semibold text-red-600">
                Worst: {worstRawScore} ({worstPercentScore}%)
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg p-6 shadow border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">
              Scores by Individual Quiz (Grouped by Skill)
            </h2>
            {chartData.length === 0 ? (
              <p className="italic text-gray-500">No quiz data to display.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="percentScore" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="bg-white rounded-lg p-6 shadow border border-gray-300">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Recent Quiz Results</h2>
            {results.length === 0 ? (
              <p className="italic text-gray-500">No quiz results available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Skill</th>
                      <th className="border border-gray-300 px-4 py-2">Quiz Difficulty</th>
                      <th className="border border-gray-300 px-4 py-2">Score</th>
                      <th className="border border-gray-300 px-4 py-2">Percentage</th>
                      <th className="border border-gray-300 px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt || b.date).getTime() -
                          new Date(a.createdAt || a.date).getTime()
                      )
                      .map((result) => {
                        const quizId = normalizeQuizId(result.quizId);
                        const quiz = quizzesMap[quizId];
                        const skillId = quiz?.skillId;
                        const skillName =
                          skillId && skillsMap[String(skillId)]
                            ? skillsMap[String(skillId)]
                            : "Unknown Skill";

                        const percentageScore = ((result.score || 0) / MAX_SCORE) * 100;

                        const keyId =
                          result.resultId || result._id || `${result.quizId}_${result.createdAt}`;

                        return (
                          <tr key={keyId} className="border border-gray-300">
                            <td className="border border-gray-300 px-4 py-2">{skillName}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              {quiz?.difficulty || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{result.score}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              {percentageScore.toFixed(2)}%
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {new Date(result.createdAt || result.date).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-10 text-center">
            <Link
              to="/dashboard"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
