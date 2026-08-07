import { useState, useEffect } from "react";
import { apiFetch, unwrapData } from "../utils/api";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("userRole") === "admin"
  );

  useEffect(() => {
    const verifyRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const res = await apiFetch("/api/v1/users/me");
        if (res.ok) {
          const payload = await res.json();
          const user = unwrapData(payload);
          const role = user?.role || "user";
          localStorage.setItem("userRole", role);
          setIsAdmin(role === "admin");
          return;
        }
      } catch (err) {
        console.warn("Admin role verify failed, using cached role");
      }

      setIsAdmin(localStorage.getItem("userRole") === "admin");
    };

    verifyRole();
  }, []);

  return isAdmin;
};
