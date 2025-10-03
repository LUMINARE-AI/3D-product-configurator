import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const [signupInfo, setSignupInfo] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const copySignupInfo = { ...signupInfo };
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return toast.error("Please fill all the fields");
    }
    try {
      const url = "http://localhost:8000/api/v1/users/register";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupInfo),
      });
      const result = await response.json();
      const { success, message, error } = result;

      if (success) {
        toast.success(message);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (error) {
        const details =
          error?.details?.[0]?.message || error || message || "Signup failed!";
        toast.error(details);
      } else if (!success) {
        toast.error(message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#E2F3FF_20.3%,#FFFFFF_80.71%)]">
        <Header />
      <div className="mt-[30px] mb-[30px] max-w-md mx-auto font-montserrat p-6">
        <form
          onSubmit={handleSignup}
          className="space-y-6 bg-white p-8 rounded-2xl shadow-md"
        >
          <h3 className="text-center text-3xl font-semibold text-gray-900">
            Signup
          </h3>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Name
            </label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              placeholder="Enter your name..."
              value={signupInfo.name}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

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
              value={signupInfo.email}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400 outline-none"
              required
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
              value={signupInfo.password}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="cursor-pointer px-7 py-3 flex items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] hover:opacity-90 transition-all"
            >
              Signup
            </button>
          </div>

          {/* Login Redirect */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </form>
        <ToastContainer />
      </div>
      <Footer />
      </div>
    </>
  );
}

export default Signup;
