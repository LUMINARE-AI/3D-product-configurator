import { useState, useEffect } from "react";

export const useAuth = () => {
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Function to check if token exists
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token); // !! converts to boolean
    };

    // Check on component mount
    checkAuth();

    // Listen for changes (optional - cross-tab sync)
    window.addEventListener("storage", checkAuth);

    // Cleanup
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return isLoggedIn; // Returns true/false
};