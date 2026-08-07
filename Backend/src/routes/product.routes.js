import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  saveCustomizations,
  getCustomizations,
  updateProduct,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/all", getAllProducts);
router.get("/:id", getProductById);
router.get("/:id/customizations", getCustomizations);

router.post(
  "/create",
  verifyJWT,
  verifyAdmin,
  upload.fields([
    { name: "modelFile", maxCount: 1 },
    { name: "coverImageURL", maxCount: 1 },
  ]),
  createProduct
);

router.post("/delete/:id", verifyJWT, verifyAdmin, deleteProduct);

router.post("/:id/customizations", verifyJWT, saveCustomizations);

router.put(
  "/edit/:id",
  verifyJWT,
  verifyAdmin,
  upload.fields([
    { name: "modelFile", maxCount: 1 },
    { name: "coverImageURL", maxCount: 1 },
  ]),
  updateProduct
);

export default router;
