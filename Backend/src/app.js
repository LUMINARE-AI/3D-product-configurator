import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ✅ Yahan add karo - cors() se pehle
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://woolcrafts.in",
  "https://www.woolcrafts.in",
  // add production URLs here
];

// ✅ Purane cors() ko replace karo is se
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
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

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/customizations", customizeRouter);
app.use("/api/v1/tripo", tripoRoutes);

export { app };
