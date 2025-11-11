import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure Gemini
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY not found in environment variables");
}

const genai = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

/**
 * Create quality assessment prompt for single image comparison
 */
function createQualityPrompt() {
    return `
As a quality control expert, analyze these product images and provide output in this format:

**QUALITY SCORE**: [Score from 0-10]/10

**DEFECTS**:
- [Defect Name]: [MINOR/MAJOR/CRITICAL] - [Location]
(list all defects found)

**VERDICT**: [PASS/FAIL/REWORK]

First image is the PERFECT REFERENCE. Compare the second image against it.
List only deviations and defects found in the second image.
Be precise and concise.
`;
}

/**
 * Create quality assessment prompt for multi-angle comparison
 */
function createMultiAnglePrompt() {
    return `
As a quality control expert, analyze these product images from multiple angles and provide output in this format:

**OVERALL QUALITY SCORE**: [Score from 0-10]/10

**FRONT VIEW ANALYSIS**:
Quality Score: [0-10]/10
Defects:
- [Defect Name]: [MINOR/MAJOR/CRITICAL] - [Location]

**BACK VIEW ANALYSIS**:
Quality Score: [0-10]/10
Defects:
- [Defect Name]: [MINOR/MAJOR/CRITICAL] - [Location]

**LEFT VIEW ANALYSIS**:
Quality Score: [0-10]/10
Defects:
- [Defect Name]: [MINOR/MAJOR/CRITICAL] - [Location]

**RIGHT VIEW ANALYSIS**:
Quality Score: [0-10]/10
Defects:
- [Defect Name]: [MINOR/MAJOR/CRITICAL] - [Location]

**ALL DEFECTS SUMMARY**:
- [Defect Name]: [MINOR/MAJOR/CRITICAL] - [Location and View]

**OVERALL VERDICT**: [PASS/FAIL/REWORK]

Images are provided in pairs (perfect reference, test sample) for each angle: Front, Back, Left, Right.
Compare each test sample angle against its corresponding perfect reference.
Front should be compared with front, back with back, left with left, right with right.
Provide detailed analysis for each angle and an overall assessment.
Be precise and concise.
`;
}

/**
 * Compare two product images using Gemini Vision
 * @param {Buffer|Uint8Array} perfectBytes - Perfect reference image bytes
 * @param {Buffer|Uint8Array} defectiveBytes - Test sample image bytes
 * @returns {Promise<Object>} Analysis result
 */
async function compareWithGemini(perfectBytes, defectiveBytes) {
    try {
        // Prepare image parts
        const imageParts = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(perfectBytes).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(defectiveBytes).toString('base64')
                }
            }
        ];
        
        // Generate analysis
        const prompt = createQualityPrompt();
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        
        // Parse the response
        return parseQualityResponse(text);
        
    } catch (error) {
        return {
            error: error.message,
            quality_score: 0,
            defects: [],
            recommendation: "ERROR",
            raw_response: `Analysis failed: ${error.message}`
        };
    }
}

/**
 * Compare product images from multiple angles using Gemini Vision
 */
async function compareMultiAngleWithGemini(
    perfectFront,
    perfectBack,
    perfectLeft,
    perfectRight,
    defectiveFront,
    defectiveBack,
    defectiveLeft,
    defectiveRight
) {
    try {
        // Prepare image parts in order
        const imageParts = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(perfectFront).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(defectiveFront).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(perfectBack).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(defectiveBack).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(perfectLeft).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(defectiveLeft).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(perfectRight).toString('base64')
                }
            },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(defectiveRight).toString('base64')
                }
            }
        ];
        
        // Generate analysis
        const prompt = createMultiAnglePrompt();
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        
        // Parse the response
        return parseMultiAngleResponse(text);
        
    } catch (error) {
        return {
            error: error.message,
            overall_score: 0,
            angle_results: {},
            defects: [],
            recommendation: "ERROR",
            raw_response: `Analysis failed: ${error.message}`
        };
    }
}

/**
 * Parse Gemini response into structured data
 */
function parseQualityResponse(content) {
    const parsed = {
        quality_score: 0,
        defects: [],
        recommendation: "UNKNOWN",
        raw_response: content
    };
    
    const lines = content.split('\n');
    let defectSection = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Extract quality score
        if (trimmedLine.toUpperCase().includes("QUALITY SCORE")) {
            const scoreMatch = trimmedLine.match(/(\d+)\/10/);
            if (scoreMatch) {
                const score = parseInt(scoreMatch[1]);
                if (score >= 0 && score <= 10) {
                    parsed.quality_score = score;
                }
            }
        }
        
        // Extract verdict/recommendation
        else if (trimmedLine.toUpperCase().includes("VERDICT") || 
                 trimmedLine.toUpperCase().includes("RECOMMENDATION")) {
            const upperLine = trimmedLine.toUpperCase();
            if (upperLine.includes("PASS")) {
                parsed.recommendation = "PASS";
            } else if (upperLine.includes("FAIL")) {
                parsed.recommendation = "FAIL";
            } else if (upperLine.includes("REWORK")) {
                parsed.recommendation = "REWORK";
            }
        }
        
        // Parse defects section
        else if (trimmedLine.toUpperCase().includes("DEFECTS") && 
                 !trimmedLine.toUpperCase().includes("ALL DEFECTS")) {
            defectSection = true;
            continue;
        }
        
        else if (defectSection) {
            if (trimmedLine.startsWith('-') && trimmedLine.includes(':')) {
                // Parse defect line
                const defectText = trimmedLine.substring(1).trim();
                try {
                    const parts = defectText.split(':');
                    if (parts.length >= 2) {
                        const defectName = parts[0].trim();
                        const rest = parts.slice(1).join(':').trim();
                        
                        let severity, location;
                        if (rest.includes('-')) {
                            const splitRest = rest.split('-');
                            severity = splitRest[0].trim().toUpperCase();
                            location = splitRest.slice(1).join('-').trim();
                        } else {
                            severity = "UNKNOWN";
                            location = rest;
                        }
                        
                        parsed.defects.push({
                            name: defectName,
                            severity: severity,
                            location: location
                        });
                    }
                } catch (error) {
                    continue;
                }
            } else if (trimmedLine.startsWith('**')) {
                defectSection = false;
            }
        }
    }
    
    return parsed;
}

/**
 * Parse multi-angle Gemini response into structured data
 */
function parseMultiAngleResponse(content) {
    const parsed = {
        overall_score: 0,
        angle_results: {
            front: { quality_score: 0, defects: [] },
            back: { quality_score: 0, defects: [] },
            left: { quality_score: 0, defects: [] },
            right: { quality_score: 0, defects: [] }
        },
        defects: [],
        recommendation: "UNKNOWN",
        raw_response: content
    };
    
    const lines = content.split('\n');
    let currentAngle = null;
    let defectSection = false;
    let allDefectsSection = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        const upperLine = trimmedLine.toUpperCase();
        
        // Extract overall quality score
        if (upperLine.includes("OVERALL QUALITY SCORE")) {
            const scoreMatch = trimmedLine.match(/(\d+)\/10/);
            if (scoreMatch) {
                const score = parseInt(scoreMatch[1]);
                if (score >= 0 && score <= 10) {
                    parsed.overall_score = score;
                }
            }
        }
        
        // Detect angle sections
        else if (upperLine.includes("FRONT VIEW")) {
            currentAngle = "front";
            defectSection = false;
        } else if (upperLine.includes("BACK VIEW")) {
            currentAngle = "back";
            defectSection = false;
        } else if (upperLine.includes("LEFT VIEW")) {
            currentAngle = "left";
            defectSection = false;
        } else if (upperLine.includes("RIGHT VIEW")) {
            currentAngle = "right";
            defectSection = false;
        }
        
        // Extract angle-specific quality score
        else if (currentAngle && upperLine.includes("QUALITY SCORE") && 
                 !upperLine.includes("OVERALL")) {
            const scoreMatch = trimmedLine.match(/(\d+)\/10/);
            if (scoreMatch) {
                const score = parseInt(scoreMatch[1]);
                if (score >= 0 && score <= 10) {
                    parsed.angle_results[currentAngle].quality_score = score;
                }
            }
        }
        
        // Detect defects section for current angle
        else if (currentAngle && upperLine.includes("DEFECTS") && 
                 !upperLine.includes("ALL DEFECTS")) {
            defectSection = true;
            continue;
        }
        
        // Detect all defects summary section
        else if (upperLine.includes("ALL DEFECTS SUMMARY")) {
            allDefectsSection = true;
            defectSection = false;
            currentAngle = null;
            continue;
        }
        
        // Extract verdict
        else if (upperLine.includes("OVERALL VERDICT") || upperLine.includes("VERDICT")) {
            if (upperLine.includes("PASS")) {
                parsed.recommendation = "PASS";
            } else if (upperLine.includes("FAIL")) {
                parsed.recommendation = "FAIL";
            } else if (upperLine.includes("REWORK")) {
                parsed.recommendation = "REWORK";
            }
        }
        
        // Parse defects for current angle
        else if (defectSection && currentAngle && 
                 trimmedLine.startsWith('-') && trimmedLine.includes(':')) {
            const defectText = trimmedLine.substring(1).trim();
            try {
                const parts = defectText.split(':');
                if (parts.length >= 2) {
                    const defectName = parts[0].trim();
                    const rest = parts.slice(1).join(':').trim();
                    
                    let severity, location;
                    if (rest.includes('-')) {
                        const splitRest = rest.split('-');
                        severity = splitRest[0].trim().toUpperCase();
                        location = splitRest.slice(1).join('-').trim();
                    } else {
                        severity = "UNKNOWN";
                        location = rest;
                    }
                    
                    parsed.angle_results[currentAngle].defects.push({
                        name: defectName,
                        severity: severity,
                        location: location
                    });
                }
            } catch (error) {
                continue;
            }
        }
        
        // Parse all defects summary
        else if (allDefectsSection && trimmedLine.startsWith('-') && 
                 trimmedLine.includes(':')) {
            const defectText = trimmedLine.substring(1).trim();
            try {
                const parts = defectText.split(':');
                if (parts.length >= 2) {
                    const defectName = parts[0].trim();
                    const rest = parts.slice(1).join(':').trim();
                    
                    let severity, location;
                    if (rest.includes('-')) {
                        const splitRest = rest.split('-');
                        severity = splitRest[0].trim().toUpperCase();
                        location = splitRest.slice(1).join('-').trim();
                    } else {
                        severity = "UNKNOWN";
                        location = rest;
                    }
                    
                    parsed.defects.push({
                        name: defectName,
                        severity: severity,
                        location: location
                    });
                }
            } catch (error) {
                continue;
            }
        }
        
        else if (trimmedLine.startsWith('**')) {
            defectSection = false;
            if (!upperLine.includes("ALL DEFECTS")) {
                allDefectsSection = false;
            }
        }
    }
    
    return parsed;
}

export {
    compareWithGemini,
    compareMultiAngleWithGemini,
    createQualityPrompt,
    createMultiAnglePrompt,
    parseQualityResponse,
    parseMultiAngleResponse
};