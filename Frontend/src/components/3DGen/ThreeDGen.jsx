import React, { useState } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:8000/api/v1/tripo";

const ThreeDGen = () => {
  const [textInput, setTextInput] = useState("");
  const [generatedModel, setGeneratedModel] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Poll task status until complete
   */
  const pollTask = async (taskId) => {
    setIsLoading(true);
    setStatus("Processing your request...");
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/task/${taskId}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch task status");
        }

        const taskData = data.message;
        
        setProgress(taskData.progress || 0);

        if (taskData.status === "success" || taskData.status === "succeeded") {
          clearInterval(interval);
          setStatus("Completed! ✨");
          setIsLoading(false);
          
          // Extract model data
          if (taskData.output?.rendered_image) {
            setGeneratedModel({
              preview: taskData.output.rendered_image,
              model: taskData.output.model,
              pbr_model: taskData.output.pbr_model,
            });
          }
        } else if (taskData.status === "failed") {
          clearInterval(interval);
          setStatus("Generation failed");
          setError("Model generation failed. Please try again.");
          setIsLoading(false);
        } else if (taskData.status === "running" || taskData.status === "queued") {
          setStatus(`Processing... ${taskData.progress || 0}%`);
        }
      } catch (err) {
        clearInterval(interval);
        console.error("Polling error:", err);
        setError(err.message);
        setIsLoading(false);
        setStatus("Error occurred");
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (isLoading) {
        setStatus("Request timeout");
        setError("Generation took too long. Please try again.");
        setIsLoading(false);
      }
    }, 300000);
  };

  /**
   * Text to Model Handler
   */
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
      
      console.log("API Response:", data); // 🔍 Debug line

      if (!data.success) {
        throw new Error(data.message || "Failed to create task");
      }

      // ✅ Fixed: Handle both data.message and data.data
      const taskId = data.message?.task_id || data.data?.task_id;
      
      if (!taskId) {
        throw new Error("No task ID received from server");
      }

      setTaskId(taskId);
      setStatus("Task created! Processing...");
      
      // Start polling
      pollTask(taskId);
    } catch (err) {
      console.error("Task creation error:", err);
      setError(err.message);
      setIsLoading(false);
      setStatus("Failed to create task");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 3D Model Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into stunning 3D models using the power of AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Preview Section */}
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
                <div className="w-full h-full p-4">
                  <img
                    src={generatedModel.preview}
                    alt="Generated 3D Model"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  
                  {/* Download Buttons */}
                  <div className="mt-4 flex gap-3">
                    {generatedModel.model && (
                      <a
                        href={generatedModel.model}
                        download
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-center font-medium hover:shadow-lg transition-all"
                      >
                        Download GLB
                      </a>
                    )}
                    {generatedModel.pbr_model && (
                      <a
                        href={generatedModel.pbr_model}
                        download
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-center font-medium hover:shadow-lg transition-all"
                      >
                        Download PBR
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Sparkles className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No model generated yet</p>
                  <p className="text-sm mt-2">Enter a prompt to get started</p>
                </div>
              )}
            </div>

            {/* Status & Error Display */}
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

          {/* Right: Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
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
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Example Prompts */}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeDGen;