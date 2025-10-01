import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import FormData from "form-data";
import fs from "fs";

const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE_URL = process.env.TRIPO_BASE_URL || "https://api.tripo3d.ai/v2/openapi";

// Text to Model - Create Task
const textToModel = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  console.log("📝 Received prompt:", prompt);

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
      console.error("❌ Tripo API Error:", errorText);
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ Tripo API Response:", JSON.stringify(data, null, 2));

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
    console.error("❌ Error in textToModel:", error);
    throw new ApiError(500, `Failed to create task: ${error.message}`);
  }
});

// Upload Image to Tripo3D
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  if (!TRIPO_API_KEY) {
    throw new ApiError(500, "Tripo API key not configured");
  }

  console.log("📤 Uploading image:", req.file.originalname);

  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch(`${TRIPO_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    // Delete uploaded file from server
    fs.unlinkSync(req.file.path);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Tripo Upload Error:", errorText);
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ Upload Response:", JSON.stringify(data, null, 2));

    if (data.code !== 0) {
      throw new ApiError(400, `Tripo API returned error code: ${data.code}`);
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
    // Cleanup file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof ApiError) {
      throw error;
    }
    console.error("❌ Error in uploadImage:", error);
    throw new ApiError(500, `Failed to upload image: ${error.message}`);
  }
});

// Single Image to Model
const imageToModel = asyncHandler(async (req, res) => {
  const { image_token, file_type } = req.body;

  console.log("🖼️ Creating image-to-model task");

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
      console.error("❌ Tripo API Error:", errorText);
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ Tripo API Response:", JSON.stringify(data, null, 2));

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
    console.error("❌ Error in imageToModel:", error);
    throw new ApiError(500, `Failed to create task: ${error.message}`);
  }
});

// Get Task Status (Polling)
const getTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  console.log("🔍 Checking task status for:", taskId);

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
      console.error("❌ Tripo API Error:", errorText);
      throw new ApiError(
        response.status,
        `Tripo API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    console.log("✅ Task Status Response:", JSON.stringify(data, null, 2));

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
    console.error("❌ Error in getTaskStatus:", error);
    throw new ApiError(500, `Failed to fetch task status: ${error.message}`);
  }
});

export { textToModel, getTaskStatus, uploadImage, imageToModel };