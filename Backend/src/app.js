import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://woolcrafts.in",
      "https://www.woolcrafts.in",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Proxy route for CORS bypass (Add before other routes)
app.get("/api/v1/tripo/proxy", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    // Fetch the model from external URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    // Get the buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Set appropriate headers
    const contentType = response.headers.get("content-type") || "model/gltf-binary";
    res.set("Content-Type", contentType);
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.set("Content-Disposition", 'attachment; filename="3d-model.glb"');

    res.send(buffer);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Failed to fetch model",
      message: error.message
    });
  }
});

//routes import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import customizeRouter from "./routes/customize.routes.js";
import tripoRoutes from "./routes/tripo.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/customizations", customizeRouter);
app.use("/api/v1/tripo", tripoRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "WoolCrafts API is running!",
    status: "active"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

export { app };