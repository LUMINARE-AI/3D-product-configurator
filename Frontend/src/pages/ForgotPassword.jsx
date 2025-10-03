import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // ✅ Success state

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error("Please enter your email");
    }

    // ✅ Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    setLoading(true);

    try {
      const response = await fetch("http://3.109.157.61:8000/api/v1/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Password reset link sent to your email!");
        setEmailSent(true); // ✅ Show success message
        setEmail("");
      } else {
        toast.error(result.message || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Error:", error);
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
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-md"
          >
            <h3 className="text-center text-3xl font-semibold text-gray-900">
              Forgot Password
            </h3>
            <p className="text-center text-sm text-gray-600">
              Enter your email and we'll send you a link to reset your password
            </p>

            {/* ✅ Success Message */}
            {emailSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Email sent successfully!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Check your inbox and spam folder for the reset link.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-md font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                required
                disabled={loading} // ✅ Disable during loading
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            {/* ✅ Resend option */}
            {emailSent && (
              <p className="text-sm text-center text-gray-600">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Try again
                </button>
              </p>
            )}

            <p className="text-sm text-center text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
          <ToastContainer 
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
          />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default ForgotPassword;