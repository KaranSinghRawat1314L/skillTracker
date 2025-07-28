import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [mobile, setMobile] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const fileInputRef = useRef();

  const token = localStorage.getItem("token");
  const backendBase = "http://localhost:5000"; // Adjust to your backend URL

  // Fetch user profile on component mount
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        if (res.data.address) setAddress(res.data.address);
        if (res.data.mobile) setMobile(res.data.mobile);
      } catch {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Handle changes in address inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Save address and mobile number
  const saveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.put(
        "/api/users/address",
        { ...address, mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
      // Optionally refresh user data to show updated info
      const res = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      setError("Failed to save address or mobile number.");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handlePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewPic(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      await axios.post("/api/users/profile-pic", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh user data to get updated profilePic
      const res = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setPreviewPic(null);
    } catch {
      setError("Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  // Compute initials from user's name
  const getInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return (
      (parts[0]?.[0] || "") +
      (parts[1]?.[0] || "")
    ).toUpperCase();
  };

  // Compute profile image URL with backend base if relative path
  const profileImage = previewPic
    ? previewPic
    : user?.profilePic
    ? user.profilePic.startsWith("http")
      ? user.profilePic
      : backendBase + user.profilePic
    : null;

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-semibold text-xl">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-md mt-12">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Profile</h1>

      {error && (
        <div className="mb-4 text-red-600 font-medium border border-red-300 bg-red-100 rounded p-2">
          {error}
        </div>
      )}

      {/* Profile Picture and Upload */}
      <section className="flex items-center gap-6 mb-8">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="h-20 w-20 object-cover rounded-full border-2 border-orange-300 shadow"
          />
        ) : (
          <div className="h-20 w-20 bg-orange-300 rounded-full flex items-center justify-center text-white font-bold text-3xl select-none shadow">
            {getInitials()}
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePicChange}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="px-5 py-2 rounded bg-orange-200 hover:bg-orange-300 transition font-semibold disabled:opacity-50"
            disabled={loading}
          >
            Upload Photo
          </button>
        </div>
      </section>

      {/* User Information */}
      <section className="mb-8 text-gray-800 space-y-1">
        <p>
          <strong>Name:</strong> {user?.name || "-"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "-"}
        </p>
        {mobile && (
          <p>
            <strong>Mobile:</strong> {mobile}
          </p>
        )}
      </section>

      {/* Address Section */}
      <section>
        <h2 className="text-2xl font-semibold text-orange-600 mb-4">Address</h2>
        {!editing ? (
          <div className="space-y-1 text-gray-700">
            {address.line1 && <p>{address.line1}</p>}
            {address.line2 && <p>{address.line2}</p>}
            {address.city && <p>{address.city}</p>}
            {address.state && <p>{address.state}</p>}
            {address.postalCode && <p>{address.postalCode}</p>}
            {address.country && <p>{address.country}</p>}
            {!address.line1 &&
              !address.line2 &&
              !address.city &&
              !address.state &&
              !address.postalCode &&
              !address.country && (
                <p className="italic text-gray-400">No address set.</p>
              )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-6 bg-orange-300 px-6 py-2 rounded hover:bg-orange-400 text-white font-semibold transition"
            >
              Edit Address
            </button>
          </div>
        ) : (
          <form onSubmit={saveAddress} className="space-y-4">
            <input
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile Number"
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
              required
              type="tel"
              pattern="[\d\s()+-]{7,}" // simple pattern for phone numbers
              title="Enter a valid phone number"
            />
            <input
              name="line1"
              value={address.line1}
              onChange={handleChange}
              placeholder="Street Address"
              required
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
            />
            <input
              name="line2"
              value={address.line2}
              onChange={handleChange}
              placeholder="Apt/Suite (optional)"
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
            />
            <input
              name="city"
              value={address.city}
              onChange={handleChange}
              placeholder="City"
              required
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
            />
            <input
              name="state"
              value={address.state}
              onChange={handleChange}
              placeholder="State"
              required
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
            />
            <input
              name="postalCode"
              value={address.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              required
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
            />
            <input
              name="country"
              value={address.country}
              onChange={handleChange}
              placeholder="Country"
              required
              className="p-3 border rounded w-full focus:ring-2 focus:ring-orange-300"
              disabled={loading}
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-300 text-white px-6 py-2 rounded hover:bg-orange-400 transition font-semibold disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setEditing(false)}
                className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {saved && (
              <p className="text-green-600 mt-2 font-semibold animate-pulse">
                Address saved!
              </p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
