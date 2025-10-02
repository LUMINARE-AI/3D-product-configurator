import { Router } from "express";
import { 
  textToModel, 
  getTaskStatus, 
  uploadImage, 
  imageToModel,
  multiImageToModel 
} from "../controllers/tripo.controller.js";
import { upload } from "../middlewares/upload.middlewares.js";

const router = Router();

// Text to Model
router.post("/text-to-model", textToModel);

// Upload Image
router.post("/upload", upload.single("file"), uploadImage);

// Single Image to Model
router.post("/image-to-model", imageToModel);

// 🆕 Multi Image to Model
router.post("/multi-image-to-model", multiImageToModel);

// Get Task Status (for polling)
router.get("/task/:taskId", getTaskStatus);

export default router;