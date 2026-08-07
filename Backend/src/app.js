import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import customizeRouter from "./routes/customize.routes.js";
import tripoRoutes from "./routes/tripo.routes.js";
import qualityRoutes from "./routes/quality.routes.js";

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://woolcrafts.in",
  "https://www.woolcrafts.in",
];

const ALLOWED_PROXY_HOSTS = [
  "tripo-data.cdn.bcebos.com",
  "tripo3d.com",
  "api.tripo3d.ai",
  "tripo-data.oss-accelerate.aliyuncs.com",
];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(generalLimiter);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Proxy for Tripo model downloads — host allowlist only (SSRF protection).
app.get("/api/v1/tripo/proxy", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    if (parsed.protocol !== "https:") {
      return res.status(400).json({ error: "Only HTTPS URLs are allowed" });
    }

    const hostAllowed = ALLOWED_PROXY_HOSTS.some(
      (allowed) =>
        parsed.hostname === allowed || parsed.hostname.endsWith(`.${allowed}`)
    );

    if (!hostAllowed) {
      return res.status(403).json({ error: "URL host is not allowed" });
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType =
      response.headers.get("content-type") || "model/gltf-binary";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.set("Content-Disposition", 'attachment; filename="3d-model.glb"');

    res.send(buffer);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Failed to fetch model",
      message: error.message,
    });
  }
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/customizations", customizeRouter);
app.use("/api/v1/tripo", tripoRoutes);
app.use("/api/v1/quality", qualityRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "WoolCrafts API is running!",
    status: "active",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

export { app };
