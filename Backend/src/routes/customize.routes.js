import express from "express";
import {
  createCustomization,
  getCustomizationById,
  deleteCustomization,
  getAllCustomizations,
  getMyCustomizations,
} from "../controllers/customize.controller.js";
import mongoose from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/save", verifyJWT, createCustomization);
router.get("/all-cust", getAllCustomizations);
router.get("/mine", verifyJWT, getMyCustomizations);

router.get(
  "/:id",
  async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    next();
  },
  getCustomizationById
);

router.delete("/:id", verifyJWT, deleteCustomization);

export default router;
