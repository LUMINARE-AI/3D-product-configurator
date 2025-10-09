import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../config.js";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

const handleLogin = async (e) => {
  e.preventDefault();
  const { email, password } = loginInfo;
  
  if (!email || !password) {
    return toast.error("Email and Password required");
  }

  setLoading(true);

  try {
    const url = `${API_URL}/api/v1/users/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInfo),
    });

    // First check if response is ok before parsing JSON
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      toast.error("Invalid Credentials. Please try again.");
      setLoading(false);
      return;
    }

    // Handle different response statuses
    if (response.ok) {
      // Success
      toast.success(result.message || "Login successful!");
      
      // Store token and role
      localStorage.setItem("token", result.data.accessToken);
      localStorage.setItem("userRole", result.data.role || "user");
      localStorage.setItem("loggedInUser", result.data.user.name);
      
      setTimeout(() => {
        navigate("/gallery");
      }, 1000);
    } else {
      // Error responses - show exact backend message
      const errorMessage = result.message || result.error || "Login failed. Please try again.";
      toast.error(errorMessage);
    }
  } catch (err) {
    console.error("Login error:", err);
    toast.error("Network error. Please check your connection.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)] min-h-screen">
        <Header />
        <div className="mt-[60px] mb-[60px] max-w-md mx-auto font-montserrat p-6">
          <form
            onSubmit={handleLogin}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-md"
          >
            <h3 className="text-center text-3xl font-semibold text-gray-900">
              Login
            </h3>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                placeholder="Enter your email..."
                value={loginInfo.email}
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                onChange={handleChange}
                type="password"
                name="password"
                placeholder="Enter your password..."
                value={loginInfo.password}
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                required
                disabled={loading}
              />
              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Signup Redirect */}
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-medium hover:underline"
              >
                Signup
              </Link>
            </p>
          </form>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
          />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Login;