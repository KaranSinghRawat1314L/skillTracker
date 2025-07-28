// src/components/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { LogOut } from "react-feather";
import { Pencil } from "lucide-react";
import axios from "axios";

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name || "");
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Adjust your backend base URL accordingly
  const backendBase = "http://localhost:5000";

  const getInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  const profileImage = user?.profilePic?.startsWith("/")
    ? `${backendBase}${user.profilePic}`
    : user?.profilePic || null;

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(`${backendBase}/api/users/profile-pic`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Assuming backend returns updated user object
      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // Ideally update user state in parent instead of reload
      window.location.reload();
    } catch (err) {
      console.error("Image upload failed:", err.response?.data || err.message);
      alert("Failed to upload profile image");
    }
  };

  // Handle name update request
  const handleNameUpdate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${backendBase}/api/users`,  // Adjust this if your backend uses a different endpoint for user update
        { name: newName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error("Name update failed:", err.response?.data || err.message);
      alert("Failed to update name");
    }
  };

  // Handle user account deletion
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${backendBase}/api/users/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Account deleted successfully.");
      window.location.href = "/";
    } catch (err) {
      console.error("Account deletion failed:", err.response?.data || err.message);
      alert("Failed to delete account");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow m-auto"
      >
        {profileImage ? (
          <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-orange-400 text-white flex items-center justify-center font-bold text-lg">
            {getInitials()}
          </div>
        )}
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute flex flex-col items-center right-0 mt-2 w-64 bg-gray-50 border border-gray-200 rounded-xl shadow-lg z-50 p-4">
          {/* Profile image section */}
          <div className="relative w-20 h-20 mb-4 group">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-orange-300"
              />
            ) : (
              <div className="w-20 h-20 bg-orange-300 rounded-full flex items-center justify-center text-white font-bold text-xl select-none shadow">
                {getInitials()}
              </div>
            )}
            {/* Pencil icon for image upload */}
            <div
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-300 shadow cursor-pointer hover:bg-gray-100 transition"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Pencil size={18} className="text-gray-600" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Name and Email with name editing */}
          <div className="mb-4 text-center w-full relative">
            {isEditing ? (
              <div className="flex flex-col items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border rounded px-2 py-1 w-full text-sm"
                />
                <button
                  onClick={handleNameUpdate}
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="group relative inline-block">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <Pencil
                  size={17}
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-[-25px] text-gray-500 cursor-pointer hover:text-gray-700 transition"
                />
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>

          

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center font-semibold justify-center bg-red-100 gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-200 rounded transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
