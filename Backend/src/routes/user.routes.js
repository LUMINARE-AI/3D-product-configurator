import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  RefreshAccessToken,
  forgotPassword,
  resetPassword,
  changeCurrentUserPassword,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/forgot-password").post(authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.route("/refresh-token").post(RefreshAccessToken);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);

export default router;
