import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch, isStrongPassword } from "../utils/api";

function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confPassword } = form;

    if (!oldPassword || !newPassword || !confPassword) {
      return toast.error("Please fill all fields");
    }
    if (!isStrongPassword(newPassword)) {
      return toast.error(
        "Password must be 8+ chars with at least one letter and one number"
      );
    }
    if (newPassword !== confPassword) {
      return toast.error("New passwords do not match");
    }
    if (oldPassword === newPassword) {
      return toast.error("New password must differ from old password");
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/users/change-password", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password changed successfully");
        setForm({ oldPassword: "", newPassword: "", confPassword: "" });
        setTimeout(() => navigate("/gallery"), 1200);
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header buttonLabel="LogOut" />
      <div className="font-montserrat min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-5"
        >
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Change Password
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Use 8+ characters with letters and numbers
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              name="confPassword"
              value={form.confPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-[#0055B1] to-[#52B0FF] disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default ChangePassword;
