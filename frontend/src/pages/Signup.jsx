import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("login")); // Key line to trigger Navbar update
      setSuccessMsg("Signup successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No token received from Google");
      }
      const res = await axios.post("/api/auth/google", {
        token: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("login")); // Key line to trigger Navbar update
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => setError("Google signup failed");

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 to-blue-700 flex items-center justify-center p-6">
      <form
        onSubmit={submitHandler}
        className="bg-white p-10 rounded-xl shadow-xl max-w-md w-full"
        noValidate
      >
        <h2 className="text-3xl font-extrabold mb-8 text-blue-800 text-center">
          Sign Up
        </h2>

        {error && (
          <div className="mb-6 bg-rose-100 text-rose-700 border border-rose-400 p-3 rounded">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-emerald-100 text-emerald-700 border border-emerald-400 p-3 rounded">
            {successMsg}
          </div>
        )}

        <label className="block mb-5">
          <span className="text-gray-700 font-semibold">Full Name</span>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="mt-1 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 w-full"
          />
        </label>

        <label className="block mb-5">
          <span className="text-gray-700 font-semibold">Email Address</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="mt-1 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 w-full"
          />
        </label>

        <label className="block mb-8">
          <span className="text-gray-700 font-semibold">Password</span>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            className="mt-1 p-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-600 w-full"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-300 disabled:opacity-50 font-semibold"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <div className="my-6 flex items-center gap-2 text-gray-500">
          <hr className="flex-grow" />
          <span>OR</span>
          <hr className="flex-grow" />
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          width="100%"
        />

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-500 font-semibold hover:underline"
            tabIndex={loading ? -1 : 0}
          >
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
