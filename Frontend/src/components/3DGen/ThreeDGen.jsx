import React, { useState, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  Upload,
  Eye,
  Download,
  Wallet,
} from "lucide-react";
import { API_URL } from "../../config";

const API_BASE = `${API_URL}/api/v1/tripo`;

const ThreeDGen = () => {
  const [mode, setMode] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [multiImages, setMultiImages] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [multiPreviews, setMultiPreviews] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });

  const [generatedModel, setGeneratedModel] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    // Fetch balance on component mount
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const res = await fetch(`${API_BASE}/balance`);
      const data = await res.json();

      if (data.success) {
        setBalance(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const pollTask = async (taskId) => {
    setIsLoading(true);
    setStatus("Processing your request...");

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/task/${taskId}`);
        const contentType = res.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch task status");
        }

        const taskData = data.data;
        setProgress(taskData.progress || 0);

        if (taskData.status === "success" || taskData.status === "succeeded") {
          clearInterval(interval);
          setStatus("Completed!");
          setIsLoading(false);

          const modelUrl =
            taskData.output?.pbr_model || taskData.result?.pbr_model?.url;
          const previewUrl =
            taskData.output?.rendered_image ||
            taskData.result?.rendered_image?.url;

          const modelData = {
            preview: previewUrl,
            model: modelUrl
              ? `${API_BASE}/proxy?url=${encodeURIComponent(modelUrl)}`
              : null,
            pbr_model: modelUrl
              ? `${API_BASE}/proxy?url=${encodeURIComponent(modelUrl)}`
              : null,
            originalUrl: modelUrl, // For download
          };

          setGeneratedModel(modelData);
        } else if (taskData.status === "failed") {
          clearInterval(interval);
          setStatus("Generation failed");
          setError("Model generation failed. Please try again.");
          setIsLoading(false);
        } else if (
          taskData.status === "running" ||
          taskData.status === "queued"
        ) {
          setStatus(`Processing... ${taskData.progress || 0}%`);
        }
      } catch (err) {
        clearInterval(interval);
        setError(err.message);
        setIsLoading(false);
        setStatus("Error occurred");
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      if (isLoading) {
        setStatus("Request timeout");
        setError("Generation took too long. Please try again.");
        setIsLoading(false);
      }
    }, 300000);
  };

  const handleTextToModel = async () => {
    if (!textInput.trim()) {
      setError("Please enter a prompt!");
      return;
    }

    setError(null);
    setGeneratedModel(null);
    setIsLoading(true);
    setStatus("Creating task...");
    setProgress(0);

    try {
      const res = await fetch(`${API_BASE}/text-to-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textInput }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create task");
      }

      const taskId = data.message?.task_id || data.data?.task_id;

      if (!taskId) {
        throw new Error("No task ID received from server");
      }

      setTaskId(taskId);
      setStatus("Task created! Processing...");
      pollTask(taskId);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setStatus("Failed to create task");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleMultiImageSelect = (e, position) => {
    const file = e.target.files[0];
    if (file) {
      setMultiImages((prev) => ({ ...prev, [position]: file }));
      setMultiPreviews((prev) => ({
        ...prev,
        [position]: URL.createObjectURL(file),
      }));
      setError(null);
    }
  };

  const handleImageToModel = async () => {
    if (!imageFile) {
      setError("Please select an image!");
      return;
    }

    setError(null);
    setGeneratedModel(null);
    setIsLoading(true);
    setStatus("Uploading image...");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.message || "Failed to upload image");
      }

      const imageToken = uploadData.data?.image_token;
      const fileExtension = imageFile.name.split(".").pop().toLowerCase();

      if (!imageToken) {
        throw new Error("No image token received from server");
      }

      setStatus("Image uploaded! Creating 3D model...");

      const taskRes = await fetch(`${API_BASE}/image-to-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_token: imageToken,
          file_type: fileExtension,
        }),
      });

      const taskData = await taskRes.json();

      if (!taskData.success) {
        throw new Error(taskData.message || "Failed to create task");
      }

      const taskId = taskData.data?.task_id;

      if (!taskId) {
        throw new Error("No task ID received from server");
      }

      setTaskId(taskId);
      pollTask(taskId);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleMultiImageToModel = async () => {
    const { front, back, right, left } = multiImages;

    if (!front || !back || !right || !left) {
      setError("Please upload all 4 images (front, back, right, left)!");
      return;
    }

    setError(null);
    setGeneratedModel(null);
    setIsLoading(true);
    setStatus("Uploading images...");
    setProgress(0);

    try {
      const imageTokens = [];
      const positions = ["front", "back", "right", "left"];

      for (const position of positions) {
        const file = multiImages[position];
        const formData = new FormData();
        formData.append("file", file);

        setStatus(`Uploading ${position} image...`);

        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error(`Failed to upload ${position} image`);
        }

        const imageToken = uploadData.data?.image_token;
        const fileExtension = file.name.split(".").pop().toLowerCase();

        if (!imageToken) {
          throw new Error(`No token received for ${position} image`);
        }

        imageTokens.push({
          image_token: imageToken,
          file_type: fileExtension,
        });
      }

      setStatus("All images uploaded! Creating 3D model...");

      const taskRes = await fetch(`${API_BASE}/multi-image-to-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_tokens: imageTokens }),
      });

      const taskData = await taskRes.json();

      if (!taskData.success) {
        throw new Error(taskData.message || "Failed to create task");
      }

      const taskId = taskData.data?.task_id;

      if (!taskId) {
        throw new Error("No task ID received from server");
      }

      setTaskId(taskId);
      pollTask(taskId);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const ImageUploadBox = ({ position, preview, onSelect, disabled }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
        {position} View
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onSelect(e, position)}
        disabled={disabled}
        className="hidden"
        id={`multi-${position}`}
      />
      <label
        htmlFor={`multi-${position}`}
        className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors bg-gray-50"
      >
        {preview ? (
          <img
            src={preview}
            alt={position}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Upload className="w-8 h-8 text-gray-400" />
        )}
      </label>
    </div>
  );

  return (
    <section className="font-montserrat min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 py-12 px-4">
      {/* Balance Badge - Top Right Corner */}
      <div className="fixed top-25 right-6 z-50">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 px-5 py-3 flex items-center gap-3 hover:shadow-2xl transition-all">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Balance</p>
            {balanceLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : balance ? (
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {balance.balance?.toFixed(2) || "0.00"}
                </p>
                <span className="text-xs text-gray-500">credits</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Unavailable</p>
            )}
          </div>
          <button
            onClick={fetchBalance}
            disabled={balanceLoading}
            className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <svg
              className={`w-4 h-4 text-gray-600 ${
                balanceLoading ? "animate-spin" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 3D Model Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into stunning 3D models using the power of AI
          </p>

          <div className="inline-flex rounded-lg overflow-hidden border-2 border-gray-200 p-1 bg-white shadow-md">
            <button
              onClick={() => {
                setMode("text");
                setError(null);
                setGeneratedModel(null);
              }}
              className={`px-6 py-3 cursor-pointer font-semibold rounded-md min-w-[130px] transition-all text-sm ${
                mode === "text"
                  ? "bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Text to 3D
            </button>
            <button
              onClick={() => {
                setMode("image");
                setError(null);
                setGeneratedModel(null);
              }}
              className={`px-6 py-3 cursor-pointer font-semibold rounded-md min-w-[130px] transition-all text-sm ${
                mode === "image"
                  ? "bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Image to 3D
            </button>
            <button
              onClick={() => {
                setMode("multi");
                setError(null);
                setGeneratedModel(null);
              }}
              className={`px-6 py-3 cursor-pointer font-semibold rounded-md min-w-[130px] transition-all text-sm ${
                mode === "multi"
                  ? "bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Multi-View to 3D
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-700 font-medium">{status}</p>
                  {progress > 0 && (
                    <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {generatedModel ? (
                <div className="w-full h-full flex flex-col p-4">
                  <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative min-h-[400px]">
                    <model-viewer
                      src={generatedModel.model}
                      alt="Generated 3D Model"
                      auto-rotate
                      camera-controls
                      shadow-intensity="1"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-700">
                        3D Preview
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-xs">
                      Click & drag to rotate • Scroll to zoom
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {generatedModel.originalUrl && (
                      <a
                        href={generatedModel.originalUrl}
                        download={`woolcrafts-model-${Date.now()}.glb`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-center font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                          generatedModel.pbr_model &&
                          generatedModel.pbr_model !== generatedModel.model
                            ? "flex-1"
                            : "w-full"
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        Download Model
                      </a>
                    )}
                    {generatedModel.pbr_model &&
                      generatedModel.pbr_model !== generatedModel.model && (
                        <a
                          href={generatedModel.originalUrl}
                          download={`woolcrafts-model-pbr-${Date.now()}.glb`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-center font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download PBR
                        </a>
                      )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Sparkles className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No model generated yet</p>
                  <p className="text-sm mt-2">
                    {mode === "text" && "Enter a prompt to get started"}
                    {mode === "image" && "Upload an image to get started"}
                    {mode === "multi" && "Upload 4 views to get started"}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {taskId && !error && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <span className="font-medium">Task ID:</span> {taskId}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
            {mode === "text" ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Text to 3D Model
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Describe what you want to create and let AI generate it
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your 3D model
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="e.g., A futuristic sports car with neon lights..."
                      className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none h-32"
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    onClick={handleTextToModel}
                    disabled={isLoading || !textInput.trim()}
                    className="w-full py-4 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate 3D Model
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Try these examples:
                  </p>
                  <div className="space-y-2">
                    {[
                      "A small cute cat sitting",
                      "A vintage wooden chair",
                      "A futuristic robot",
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTextInput(example)}
                        disabled={isLoading}
                        className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors disabled:opacity-50"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : mode === "image" ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Image to 3D Model
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Upload an image and convert it to a 3D model
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isLoading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors bg-gray-50"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-600 font-medium">
                              Click to upload image
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              PNG, JPG, WEBP up to 10MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleImageToModel}
                    disabled={isLoading || !imageFile}
                    className="w-full py-4 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate 3D Model
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Multi-View to 3D Model
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Upload 4 images from different angles for better 3D
                    reconstruction
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ImageUploadBox
                      position="front"
                      preview={multiPreviews.front}
                      onSelect={handleMultiImageSelect}
                      disabled={isLoading}
                    />
                    <ImageUploadBox
                      position="back"
                      preview={multiPreviews.back}
                      onSelect={handleMultiImageSelect}
                      disabled={isLoading}
                    />
                    <ImageUploadBox
                      position="right"
                      preview={multiPreviews.right}
                      onSelect={handleMultiImageSelect}
                      disabled={isLoading}
                    />
                    <ImageUploadBox
                      position="left"
                      preview={multiPreviews.left}
                      onSelect={handleMultiImageSelect}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-xs">
                      <span className="font-semibold">Tip:</span> For best
                      results, take photos from front, back, right, and left
                      sides with consistent lighting and background.
                    </p>
                  </div>

                  <button
                    onClick={handleMultiImageToModel}
                    disabled={
                      isLoading ||
                      !multiImages.front ||
                      !multiImages.back ||
                      !multiImages.right ||
                      !multiImages.left
                    }
                    className="w-full py-4 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate 3D Model
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeDGen;
