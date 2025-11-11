import express from 'express';
import multer from 'multer';
import { compareSingleAngle, compareMultiAngle } from '../controllers/qualityController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Single angle comparison
router.post('/compare-single', upload.fields([
    { name: 'perfectImage', maxCount: 1 },
    { name: 'defectiveImage', maxCount: 1 }
]), compareSingleAngle);

// Multi-angle comparison
router.post('/compare-multi', upload.fields([
    { name: 'perfectFront', maxCount: 1 },
    { name: 'perfectBack', maxCount: 1 },
    { name: 'perfectLeft', maxCount: 1 },
    { name: 'perfectRight', maxCount: 1 },
    { name: 'defectiveFront', maxCount: 1 },
    { name: 'defectiveBack', maxCount: 1 },
    { name: 'defectiveLeft', maxCount: 1 },
    { name: 'defectiveRight', maxCount: 1 }
]), compareMultiAngle);

export default router;