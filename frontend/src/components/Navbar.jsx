import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ProfileDropdown from "./ProfileDropdown"; // 👈 Import it

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user profile from backend
  const fetchUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    axios
      .get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Listen for login/logout SPA events
  useEffect(() => {
    const handleLogin = () => {
      setLoadingUser(true);
      fetchUser();
    };
    window.addEventListener("login", handleLogin);
    const handleStorage = (e) => {
      if (e.key === "user-just-logged-in") {
        setLoadingUser(true);
        fetchUser();
        localStorage.removeItem("user-just-logged-in");
      }
      if (e.key === "user-just-logged-out") {
        setUser(null);
        setLoadingUser(false);
        localStorage.removeItem("user-just-logged-out");
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Hide/show Navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 48) setVisible(true);
      else if (window.scrollY > lastScrollY.current) setVisible(false);
      else setVisible(true);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mobile menu outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest("#hamburger-btn")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // User initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Logout handler for dropdown
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    localStorage.setItem("user-just-logged-out", Date.now());
    navigate("/login");
  };

  // NavLink styling
  const linkClassName = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "text-blue-600 border-b-2 border-blue-600"
        : "text-gray-700 hover:text-blue-600"
    }`;

  if (loadingUser) return null; // Wait for auth status

  // Auth links for the right side
  let authLinks = null;
  if (!user) {
    if (location.pathname === "/signup") {
      authLinks = (
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded font-semibold"
        >
          Login
        </Link>
      );
    } else if (location.pathname === "/login") {
      authLinks = (
        <Link
          to="/signup"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded font-semibold"
        >
          Sign Up
        </Link>
      );
    } else {
      authLinks = (
        <>
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded font-semibold"
          >
            Login
          </Link>
          <Link to="/signup" className="hover:underline font-medium ml-4">
            Sign Up
          </Link>
        </>
      );
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-extrabold text-2xl tracking-wide text-blue-600"
        >
          <span className="bg-orange-200 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 font-black text-xl select-none">
            🧠
          </span>
          SkillTracker
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex space-x-4">
          <NavLink to="/dashboard" className={linkClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/skilladd" className={linkClassName}>
            Add Skills
          </NavLink>
          <NavLink to="/performance" className={linkClassName}>
            Performance
          </NavLink>
          <NavLink to="/profile" className={linkClassName}>
            Profile
          </NavLink>
        </div>

        {/* Hamburger button for mobile */}
        <button
          id="hamburger-btn"
          className="md:hidden p-2 rounded-md text-blue-600 hover:bg-blue-100"
          aria-label="Toggle Mobile Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Right side: ProfileDropdown or Auth Links */}
        <div
          className={`ml-4 flex items-center min-w-[120px] justify-end`}
        >
          {user ? (
            <ProfileDropdown user={user} onLogout={handleLogout} />
          ) : (
            <div className="flex gap-4">{authLinks}</div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-gray-200 bg-white shadow-md"
        >
          <nav className="px-4 py-3 flex flex-col space-y-1 font-semibold text-gray-700">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "hover:text-blue-600 hover:bg-blue-50"
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/skilladd"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "hover:text-blue-600 hover:bg-blue-50"
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Add Skills
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "hover:text-blue-600 hover:bg-blue-50"
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </NavLink>
          </nav>
        </div>
      )}
    </nav>
  );
}
