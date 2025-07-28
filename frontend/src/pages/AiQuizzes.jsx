import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function AIQuizzes() {
  const [skills, setSkills] = useState([]);
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);

  const token = localStorage.getItem("token");
  const location = useLocation();

  // Fetch skills on mount
  useEffect(() => {
    if (!token) return;

    axios
      .get("/api/skills", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSkills(res.data))
      .catch(() => setSkills([]));
  }, [token]);

  // Set preselected skill if in navigation state
  useEffect(() => {
    if (location.state?.preselectedSkill) {
      setSkill(location.state.preselectedSkill);
    }
  }, [location.state]);

  // Generate AI quiz
  const generateQuiz = async (e) => {
    e.preventDefault();
    setError("");
    setQuiz(null);
    setResult(null);
    setUserAnswers([]);
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/quizzes/generate",
        { skill, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQuiz(data);
      setUserAnswers(Array(data.questions.length).fill(""));
      setTimeStarted(Date.now());
    } catch (err) {
      setError(err.response?.data?.message || "AI quiz generation failed");
    } finally {
      setLoading(false);
    }
  };

  // Update user's answer selection
  const handleAnswerChange = (questionIdx, answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIdx] = answer;
    setUserAnswers(newAnswers);
  };

  // Submit quiz for AI evaluation
  const submitQuiz = async () => {
    if (!quiz) return;
    if (userAnswers.includes("")) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const timeTakenSeconds = Math.floor((Date.now() - timeStarted) / 1000);
      const response = await axios.post(
        "/api/results/evaluate",
        {
          quizId: quiz.quizId || quiz._id, // Use whichever field your backend returns
          userAnswers,
          timeTaken: timeTakenSeconds,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to evaluate quiz with AI.");
    } finally {
      setLoading(false);
    }
  };

  // Reset everything for a new quiz
  const retakeQuiz = () => {
    setQuiz(null);
    setUserAnswers([]);
    setResult(null);
    setError("");
    setTimeStarted(null);
  };

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center px-4 py-10 ">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl border border-slate-100">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Generate &amp; Take AI Quiz
        </h1>

        {error && (
          <div className="bg-rose-100 border border-rose-300 text-rose-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Quiz generation form */}
        {!quiz && (
          <form onSubmit={generateQuiz} className="space-y-4">
            <div>
              <label
                className="block font-semibold text-slate-600 mb-1"
                htmlFor="skill-select"
              >
                Skill
              </label>
              <select
                id="skill-select"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="" disabled>
                  Select a skill
                </option>
                {skills.map((skillItem) => (
                  <option
                    key={skillItem.skillId || skillItem._id || skillItem.name}
                    value={skillItem.name}
                  >
                    {skillItem.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block font-semibold text-slate-600 mb-1"
                htmlFor="difficulty-select"
              >
                Difficulty
              </label>
              <select
                id="difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-200"
                required
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-400 text-white px-6 py-2 rounded font-semibold hover:bg-blue-500 transition w-full"
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </button>
          </form>
        )}

        {/* Quiz questions and answers */}
        {quiz && !result && (
          <>
            <h2 className="text-xl font-bold text-blue-500 mb-2">Quiz Questions</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuiz();
              }}
              className="space-y-6"
            >
              <ol className="list-decimal pl-6 space-y-5">
                {quiz.questions.map((q, i) => (
                  <li
                    key={q.prompt || i}
                    className="bg-blue-50 rounded p-4 border border-blue-100 shadow"
                  >
                    <p className="text-lg font-semibold mb-3">{q.prompt}</p>
                    <ul className="space-y-2">
                      {q.options.map((option, idx) => (
                        <li key={option}>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${i}`}
                              value={option}
                              checked={userAnswers[i] === option}
                              onChange={() => handleAnswerChange(i, option)}
                              className="mr-2"
                              required
                            />
                            <span>{option}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded font-semibold transition"
              >
                {loading ? "Submitting..." : "Submit Quiz"}
              </button>
            </form>
          </>
        )}

        {/* Display AI evaluation feedback */}
        {result && (
          <div className="mt-8 bg-green-50 border border-green-300 rounded p-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">Quiz Results</h2>
            <p className="mb-4">
              Score: {result.score} / {quiz.questions.length} (
              {Math.round((result.score / quiz.questions.length) * 100)}%)
            </p>
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">AI Feedback</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{result.aiFeedback}</pre>
            </div>
            <button
              onClick={retakeQuiz}
              className="mt-6 bg-blue-400 hover:bg-blue-500 text-white px-6 py-2 rounded font-semibold transition"
            >
              Generate Another Quiz
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
