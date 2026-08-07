import { API_URL } from "../config";

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_URL}/api/v1/users/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("loggedInUser");
        throw new Error("Session expired");
      }

      const payload = await res.json();
      const accessToken = payload?.data?.accessToken;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }
      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const { headers, skipAuthRefresh = false, ...rest } = options;
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...rest,
      headers: authHeaders({
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      }),
    });

  let response = await doFetch();

  if (response.status === 401 && !skipAuthRefresh) {
    try {
      await refreshAccessToken();
      response = await doFetch();
    } catch {
      // refresh failed — return original 401
    }
  }

  return response;
}

/** Normalize ApiResponse payload — data lives in `data`, with legacy `message` fallback */
export function unwrapList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.message)) return payload.message;
  return [];
}

export function unwrapData(payload) {
  if (!payload) return null;
  if (
    payload.data !== undefined &&
    !Array.isArray(payload) &&
    typeof payload.data !== "string"
  ) {
    return payload.data;
  }
  if (payload.message && typeof payload.message === "object") {
    return payload.message;
  }
  return payload.data ?? null;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isStrongPassword(password) {
  const p = String(password || "");
  return p.length >= 8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p);
}
