import { ApiError } from "./ApiError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    throw new ApiError(400, "Email is required");
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) {
    throw new ApiError(400, "Please enter a valid email address");
  }
  return normalized;
}

/** Min 8 chars, at least one letter and one number */
export function validatePassword(password, { minLength = 8 } = {}) {
  if (!password || typeof password !== "string") {
    throw new ApiError(400, "Password is required");
  }
  if (password.length < minLength) {
    throw new ApiError(
      400,
      `Password must be at least ${minLength} characters`
    );
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError(
      400,
      "Password must contain at least one letter and one number"
    );
  }
  return password;
}
