import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import FormData from "form-data";
import fs from "fs";
import axios from "axios";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE_URL = process.env.TRIPO_BASE_URL || "https://api.tripo3d.ai/v2/openapi";

// Text to Model - Create Task
const textToModel = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new ApiError(400, "Prompt is required");
  }

  if (!TRIPO_API_KEY) {
    throw new ApiError(500, "Tripo API key not configured");
  }

  try {
    const response = await fetch(`${TRIPO_BASE_URL}/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
      body: JSON.stringify({
        type: "text_to_model",
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new ApiError(400, `Tripo API returned error code: ${data.code}`);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, data.data, "Task created successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to create task: ${error.message}`);
  }
});

// Upload Image to Tripo3D - AXIOS VERSION
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  if (!TRIPO_API_KEY) {
    throw new ApiError(500, "Tripo API key not configured");
  }

  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(req.file.path);
    
    formData.append("file", fileStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${TRIPO_BASE_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    fs.unlinkSync(req.file.path);

    const data = response.data;

    if (data.code !== 0) {
      throw new ApiError(400, `Tripo API returned error code: ${data.code} - ${data.message || 'Unknown error'}`);
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          image_token: data.data.image_token,
          filename: req.file.originalname,
        },
        "Image uploaded successfully"
      )
    );
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.response) {
      throw new ApiError(
        error.response.status,
        `Tripo API error: ${JSON.stringify(error.response.data)}`
      );
    }

    throw new ApiError(500, `Failed to upload image: ${error.message}`);
  }
});

// Single Image to Model
const imageToModel = asyncHandler(async (req, res) => {
  const { image_token, file_type } = req.body;

  if (!image_token || !file_type) {
    throw new ApiError(400, "Image token and file type are required");
  }

  if (!TRIPO_API_KEY) {
    throw new ApiError(500, "Tripo API key not configured");
  }

  try {
    const response = await fetch(`${TRIPO_BASE_URL}/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
      body: JSON.stringify({
        type: "image_to_model",
        file: {
          type: file_type,
          file_token: image_token,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new ApiError(400, `Tripo API returned error code: ${data.code}`);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data.data, "Task created successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to create task: ${error.message}`);
  }
});

// 🆕 Multi-Image to Model
const multiImageToModel = asyncHandler(async (req, res) => {
  const { image_tokens } = req.body;

  if (!image_tokens || !Array.isArray(image_tokens)) {
    throw new ApiError(400, "Image tokens array is required");
  }

  if (image_tokens.length !== 4) {
    throw new ApiError(400, "Exactly 4 images are required (front, back, right, left)");
  }

  if (!TRIPO_API_KEY) {
    throw new ApiError(500, "Tripo API key not configured");
  }

  try {
    // Format files array according to API documentation
    const files = image_tokens.map(token => ({
      type: token.file_type,
      file_token: token.image_token
    }));

    const response = await fetch(`${TRIPO_BASE_URL}/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
      body: JSON.stringify({
        type: "multiview_to_model",
        files: files,
        model_version: "v2.5-20250123"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new ApiError(400, `Tripo API returned error code: ${data.code}`);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data.data, "Multi-view task created successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to create multi-view task: ${error.message}`);
  }
});

// Get Task Status (Polling)
const getTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!taskId || taskId === "undefined") {
    throw new ApiError(400, "Valid Task ID is required");
  }

  if (!TRIPO_API_KEY) {
    throw new ApiError(500, "Tripo API key not configured");
  }

  try {
    const response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new ApiError(400, `Tripo API returned error code: ${data.code}`);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, data.data, "Task status fetched successfully")
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, `Failed to fetch task status: ${error.message}`);
  }
});

export { textToModel, getTaskStatus, uploadImage, imageToModel, multiImageToModel };