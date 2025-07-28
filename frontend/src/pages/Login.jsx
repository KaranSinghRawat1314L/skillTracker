import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("login"));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      if (!credentialResponse?.credential) throw new Error("No token received from Google");
      const res = await axios.post("/api/auth/google", { token: credentialResponse.credential });
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("login"));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Google login failed");
    }
    setLoading(false);
  };

  const handleGoogleError = () => setError("Google login failed");

  return (
    <div className="flex min-h-screen justify-center items-center bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
      <form onSubmit={submitHandler} className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full" noValidate>
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-800">Log In</h2>
        {error && <p className="text-red-600 text-center mb-6 font-medium">{error}</p>}

        <label className="block mb-4">
          <span className="text-gray-700 font-semibold">Email</span>
          <input
            type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required disabled={loading}
            className="mt-1 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 w-full"
          />
        </label>

        <label className="block mb-8">
          <span className="text-gray-700 font-semibold">Password</span>
          <input
            type="password" placeholder="Your password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={loading}
            className="mt-1 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 w-full"
          />
        </label>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition">
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="my-6 flex items-center gap-2 text-gray-500">
          <hr className="flex-grow" />
          <span>OR</span>
          <hr className="flex-grow" />
        </div>

        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} width="100%" />

        <p className="mt-6 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-orange-500 font-semibold hover:underline">Sign Up</Link>
        </p>

        
      </form>
    </div>
  );
}
