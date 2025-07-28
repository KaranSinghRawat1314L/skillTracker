// src/pages/SkillDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]); // New state for quiz results
  const [loading, setLoading] = useState(true);

  // States for quiz detail viewing
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id || !token) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch user skills
        const skillsRes = await axios.get("/api/skills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Find skill by skillId (not _id)
        const foundSkill = skillsRes.data.find((s) => s.skillId === id);
        setSkill(foundSkill);

        // Fetch quizzes and filter by skillId
        const quizRes = await axios.get("/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = quizRes.data.filter((q) => {
          if (typeof q.skillId === "string") return q.skillId === id;
          // In case skillId is an object with skillId or _id property
          if (typeof q.skillId === "object")
            return q.skillId.skillId === id || q.skillId._id === id;
          return false;
        });
        setQuizzes(filtered);

        // Fetch user's quiz results to map scores
        const resultsRes = await axios.get("/api/results/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(resultsRes.data);
      } catch (err) {
        setError("Failed to load skill or quizzes.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, token]);

  // Clear quiz selection state
  function clearSelectedQuiz() {
    setSelectedQuiz(null);
    setQuizResult(null);
    setError(null);
    setLoadingResult(false);
  }

  // Load quiz result for selected quiz
  async function viewQuizResult(quiz) {
    setSelectedQuiz(quiz);
    setQuizResult(null);
    setError(null);
    setLoadingResult(true);
    try {
      // Instead of fetching again, try to find result in already fetched results array
      const result = results.find((r) => {
        let resQuizId = r.quizId;
        if (typeof r.quizId === "object")
          resQuizId = r.quizId.quizId || r.quizId._id;

        const quizId = quiz.quizId || quiz._id;
        return resQuizId === quizId;
      });

      setQuizResult(result || null);
      if (!result) setError("No result found for this quiz yet.");
    } catch (err) {
      setError("Failed to load quiz result.");
    } finally {
      setLoadingResult(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-semibold text-xl">
        Loading skill details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto p-8 text-red-600 font-semibold">
        {error}
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }


  if (!skill) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-semibold text-xl">
        Skill not found.
      </div>
    );
  }


  return (
    <main className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-xl shadow-lg mt-12">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">{skill.name}</h1>
      <section className="mb-8 text-gray-800 space-y-2">
        <div>
          <span className="font-semibold text-orange-600">Difficulty:</span>{" "}
          {skill.difficultyLevel}
        </div>
        <div>
          <span className="font-semibold text-orange-600">Subskills:</span>{" "}
          {skill.subSkills?.length > 0 ? skill.subSkills.join(", ") : "No subskills listed"}
        </div>
        <div>
          <span className="font-semibold text-orange-600">Created:</span>{" "}
          {new Date(skill.createdAt).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold text-orange-600">Updated:</span>{" "}
          {new Date(skill.updatedAt).toLocaleString()}
        </div>
      </section>

      <h2 className="text-xl font-bold text-blue-600 mb-4">AI Quizzes</h2>
      {quizzes.length === 0 ? (
        <p className="italic text-gray-400 mb-6">No quizzes generated yet.</p>
      ) : (
        <ul className="space-y-4 mb-6">
          {quizzes.map((quiz) => {
            // Find the score for this quiz if exists
            const quizScoreObj = results.find((r) => {
              let resQuizId = r.quizId;
              if (typeof resQuizId === "object") {
                resQuizId = resQuizId.quizId || resQuizId._id;
              }
              const quizId = quiz.quizId || quiz._id;
              return resQuizId === quizId;
            });
            const score = quizScoreObj ? quizScoreObj.score : null;

            return (
              <li
                key={quiz.quizId || quiz._id}
                className="p-4 border border-blue-200 rounded shadow-sm bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-blue-700">Difficulty: {quiz.difficulty}</p>
                    <p className="text-xs text-gray-600">
                      Created: {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                    {score !== null && (
                      <p className="text-sm font-semibold text-green-700">
                        Score: {score} / {quiz.questions.length} (
                        {Math.round((score / quiz.questions.length) * 100)}%)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      selectedQuiz?.quizId === quiz.quizId || selectedQuiz?._id === quiz._id
                        ? clearSelectedQuiz()
                        : viewQuizResult(quiz)
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded font-semibold"
                  >
                    {selectedQuiz?.quizId === quiz.quizId || selectedQuiz?._id === quiz._id
                      ? "Close"
                      : "View Quiz"}
                  </button>
                </div>

                {(selectedQuiz?.quizId === quiz.quizId || selectedQuiz?._id === quiz._id) && (
                  <>
                    {/* Quiz Questions */}
                    <section className="mt-4 bg-white rounded border p-4 shadow-inner">
                      <h3 className="text-lg font-semibold text-blue-600 mb-3">Questions</h3>
                      <ol className="list-decimal list-inside space-y-4">
                        {quiz.questions.map((q, i) => (
                          <li key={i}>
                            <p className="font-semibold">{q.prompt}</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                              {q.options.map((opt, idx) => {
                                const isCorrect = opt === q.answer;
                                let userSelected = false;
                                if (quizResult?.userAnswers?.length > 0)
                                  userSelected = quizResult.userAnswers[i] === opt;
                                return (
                                  <li
                                    key={idx}
                                    className={
                                      isCorrect
                                        ? "font-bold text-green-600"
                                        : userSelected
                                        ? "text-red-600"
                                        : ""
                                    }
                                  >
                                    {opt}
                                    {isCorrect && <span className="ml-1 text-xs">(Correct Answer)</span>}
                                    {userSelected && !isCorrect && (
                                      <span className="ml-1 text-xs">(Your Answer)</span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                            {q.explanation && (
                              <p className="text-sm italic text-gray-500 mt-1">Explanation: {q.explanation}</p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </section>

                    
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <Link to="/dashboard" className="text-orange-600 hover:underline font-semibold">
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
