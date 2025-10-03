import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, saveCustomizations, getCustomizations, updateProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "modelFile", maxCount: 1 },
    { name: "coverImageURL", maxCount: 1 },
  ]),
  createProduct
);

router.post("/delete/:id", deleteProduct);

router.get("/all", getAllProducts);

router.get("/:id", getProductById);

router.get("/:id/customizations", getCustomizations);

router.post("/:id/customizations", saveCustomizations);



router.put(
  "/edit/:id",
  upload.fields([
    { name: "modelFile", maxCount: 1 },
    { name: "coverImageURL", maxCount: 1 },
  ]),
  updateProduct
);

export default router;
