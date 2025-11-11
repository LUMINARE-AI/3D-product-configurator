import { compareWithGemini, compareMultiAngleWithGemini } from '../utils/geminiQuality.js';
import fs from 'fs';

export const compareSingleAngle = async (req, res) => {
    try {
        // Expecting two image files: perfectImage and defectiveImage
        if (!req.files || !req.files.perfectImage || !req.files.defectiveImage) {
            return res.status(400).json({ error: 'Both perfect and defective images are required' });
        }

        const perfectImage = req.files.perfectImage[0];
        const defectiveImage = req.files.defectiveImage[0];

        const perfectBytes = fs.readFileSync(perfectImage.path);
        const defectiveBytes = fs.readFileSync(defectiveImage.path);

        const result = await compareWithGemini(perfectBytes, defectiveBytes);

        // Clean up uploaded files
        fs.unlinkSync(perfectImage.path);
        fs.unlinkSync(defectiveImage.path);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const compareMultiAngle = async (req, res) => {
    try {
        const requiredFields = [
            'perfectFront', 'perfectBack', 'perfectLeft', 'perfectRight',
            'defectiveFront', 'defectiveBack', 'defectiveLeft', 'defectiveRight'
        ];

        // Check if all required images are present
        for (const field of requiredFields) {
            if (!req.files || !req.files[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Read all image files
        const images = {};
        for (const field of requiredFields) {
            images[field] = fs.readFileSync(req.files[field][0].path);
        }

        const result = await compareMultiAngleWithGemini(
            images.perfectFront,
            images.perfectBack,
            images.perfectLeft,
            images.perfectRight,
            images.defectiveFront,
            images.defectiveBack,
            images.defectiveLeft,
            images.defectiveRight
        );

        // Clean up uploaded files
        for (const field of requiredFields) {
            fs.unlinkSync(req.files[field][0].path);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};