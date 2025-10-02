import express from 'express';
import { createCustomization, getCustomizationById, deleteCustomization, getAllCustomizations } from '../controllers/customize.controller.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/save', createCustomization);

router.get('/all-cust', getAllCustomizations);

router.get('/:id', async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  next();
}, getCustomizationById);

router.delete('/:id', deleteCustomization);

export default router;