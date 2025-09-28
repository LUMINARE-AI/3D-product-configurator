import React, { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "3D-Studio", to: "/studio" },
  {label: "Generation", to: "/generation" },
];

export default function Header({buttonLabel = "Login"}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // lock body scroll when mobile menu is open
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="font-montserrat w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <div>
          <a href="/">
            <img
              src="src/assets/images/logo.png"
              alt="Logo Ipsom"
              className="h-10 w-auto"
            />
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 text-[#000] font-medium">
          {NAV_LINKS.map((link) => (
            <a
              key={link.to}
              href={link.to}
              className="font-montserrat font-semibold text-lg hover:text-[#3A2714]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop button */}
        <button className=" font-montserrat hidden md:flex px-7 py-3 items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] transition-all duration-700 ease-in-out hover:bg-[#d93a75]">
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

          <button className="font-montserrat mt-4 px-7 py-3 rounded-xl font-semibold text-white bg-[#e94a85] hover:bg-[#d93a75] transition-all duration-700 ease-in-out">
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
    </header>
  );
}
