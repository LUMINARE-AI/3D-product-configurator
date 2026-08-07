import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).slice(0, 20);
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^\w.\-]/g, "_")
      .slice(0, 80);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeBase}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
