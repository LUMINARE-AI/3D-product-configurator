import { useNavigate } from "react-router-dom";


export default function StudioHeader( {buttonLabel}) {
  const navigate = useNavigate();

  return (
    <header className="font-montserrat fixed top-0 left-0 w-full z-[99] bg-transparent ">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex gap-5 items-center">
          <button
            onClick={() => navigate("/gallery")}
            className="cursor-pointer flex items-center text-lg font-medium text-[#000]"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
              <path d="M21 12H9" />
            </svg>
            Back to Gallery
          </button>

          <div className="font-bold flex items-center gap-2 text-xl">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            3D Studio
          </div>
        </div>

        {/* Right Side */}
        <button className="font-montserrat cursor-pointer hidden md:flex px-7 py-3 items-center justify-center gap-2 rounded-xl font-semibold text-white shadow bg-gradient-to-r from-[#0055B1] to-[#52B0FF] transition-all duration-700 ease-in-out">
          {buttonLabel}
        </button>
      </div>
    </header>
  );
}
