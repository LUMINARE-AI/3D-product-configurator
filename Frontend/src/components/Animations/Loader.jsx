// Loader.jsx
import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-lg font-semibold">Loading 3D Model...</p>
      </div>
    </div>
  );
}
