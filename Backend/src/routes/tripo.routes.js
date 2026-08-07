import { Router } from "express";
import {
  textToModel,
  getTaskStatus,
  uploadImage,
  imageToModel,
  multiImageToModel,
  getBalance,
} from "../controllers/tripo.controller.js";
import { upload } from "../middlewares/upload.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { aiLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(aiLimiter);

router.post("/text-to-model", textToModel);
router.post("/upload", upload.single("file"), uploadImage);
router.post("/image-to-model", imageToModel);
router.post("/multi-image-to-model", multiImageToModel);
router.get("/task/:taskId", getTaskStatus);
router.get("/balance", getBalance);

export default router;
