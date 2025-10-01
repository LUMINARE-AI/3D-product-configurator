import express from 'express';
import { createCustomization, getCustomizationById, deleteCustomization, getAllCustomizations } from '../controllers/customize.controller.js';

const router = express.Router();

router.post('/save', createCustomization);

router.get('/all-cust', getAllCustomizations);

router.get('/:id', getCustomizationById);

router.delete('/:id', deleteCustomization);

export default router;