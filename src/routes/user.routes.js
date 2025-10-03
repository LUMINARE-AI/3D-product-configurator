import {Router} from "express";
import { registerUser, loginUser, logoutUser, RefreshAccessToken, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
//secured routes
router.route('/logout').post(verifyJWT,logoutUser);
router.route('/refresh-token').post(verifyJWT, RefreshAccessToken);
router.post("/reset-password/:token", resetPassword);

export default router
