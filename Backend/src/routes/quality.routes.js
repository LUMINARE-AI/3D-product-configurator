import express from "express";
import multer from "multer";
import {
  compareSingleAngle,
  compareMultiAngle,
} from "../controllers/quality.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { aiLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(verifyJWT);
router.use(aiLimiter);

router.post(
  "/compare-single",
  upload.fields([
    { name: "perfectImage", maxCount: 1 },
    { name: "defectiveImage", maxCount: 1 },
  ]),
  compareSingleAngle
);

router.post(
  "/compare-multi",
  upload.fields([
    { name: "perfectFront", maxCount: 1 },
    { name: "perfectBack", maxCount: 1 },
    { name: "perfectLeft", maxCount: 1 },
    { name: "perfectRight", maxCount: 1 },
    { name: "defectiveFront", maxCount: 1 },
    { name: "defectiveBack", maxCount: 1 },
    { name: "defectiveLeft", maxCount: 1 },
    { name: "defectiveRight", maxCount: 1 },
  ]),
  compareMultiAngle
);

export default router;
