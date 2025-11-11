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

//routes import
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import customizeRouter from "./routes/customize.routes.js";
import tripoRoutes from "./routes/tripo.routes.js";
import qualityRoutes from "./routes/quality.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/customizations", customizeRouter);
app.use("/api/v1/tripo", tripoRoutes);
app.use("/api/v1/quality", qualityRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "WoolCrafts API is running!",
    status: "active"
  });
});

export { app };