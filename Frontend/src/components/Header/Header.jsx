import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../../assets/images/logo.png"; // path adjust karo
import { API_URL } from "../../config";

<img
  src={Logo}
  alt="Logo Ipsom"
  className="h-10 w-auto"
/>


const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "3D-Studio", to: "/gallery", requiresAuth: true },
  { label: "3D-GenAI", to: "/3d-page", requiresAuth: true },
];

export default function Header({ buttonLabel = "Login" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // lock body scroll when mobile menu is open
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

const handleLogout = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/users/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("Server logout failed, clearing local data anyway");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userRole"); // ✅ Clear role
    toast.success("Logout successfully!");
    navigate("/");
    
  } catch (error) {
    console.error("Logout failed:", error.message);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole"); // ✅ Clear role
    toast.info("Logged out locally");
    navigate("/");
  }
};

  return (
    <header className="font-montserrat w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <div>
          <a href="/">
            <img
              src={Logo}
              alt="Logo Ipsom"
              className="h-10 w-auto"
            />
          </a>
        </div>

        {/* Desktop Nav */}
        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 text-[#000] font-medium">
          {NAV_LINKS.map((link) => {
            const isLoggedIn = localStorage.getItem("token");
            const isProtected = link.requiresAuth;

            return (
              <a
                key={link.to}
                href={isProtected && !isLoggedIn ? "/login" : link.to}
                onClick={(e) => {
                  if (isProtected && !isLoggedIn) {
                    e.preventDefault();
                    navigate("/login");
                  }
                }}
                className="font-montserrat font-semibold text-lg hover:text-[#3A2714]"
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop button */}
        <button
          onClick={() => buttonLabel === "LogOut" ? handleLogout() : navigate("/login")}
          className=" font-montserrat cursor-pointer hidden md:flex px-7 py-3 items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] transition-all duration-700 ease-in-out hover:bg-[#d93a75]"
        >
          {buttonLabel}
          <i className="fa-solid fa-right-to-bracket"></i>
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)} // 👈 ye add karo
          id="menu-toggle"
          className="font-montserrat md:hidden flex items-center text-[#000] focus:outline-none"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={` font-montserrat md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="font-montserrat p-6 flex flex-col space-y-6">
          <button
            id="menu-toggle"
            onClick={() => setMenuOpen(false)} // 👈 ye add karo
            className="md:hidden flex items-center text-[#000] focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          {NAV_LINKS.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className="text-lg font-semibold text-[#000] hover:text-[#3A2714]"
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={() => navigate("/login")}
            className="font-montserrat cursor-pointer mt-4 px-7 py-3 rounded-xl font-semibold text-white bg-[#e94a85] hover:bg-[#d93a75] transition-all duration-700 ease-in-out"
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="font-montserrat fixed inset-0 bg-black opacity-40 z-40"
          aria-hidden="true"
        />
      )}
      <ToastContainer />
    </header>
  );
}
