import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const uploadFileToS3 = async (file) => {
  try {
    const safeName = path.basename(file.originalname).replace(/[^\w.\-]/g, "_");
    const fileKey = `${uuidv4()}-${safeName}`;
    const fileContent = fs.readFileSync(file.path);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return {
      url: data.Location,
      key: fileKey,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

const extractFileKey = (url) => {
  try {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname.substring(1));
  } catch (err) {
    console.error("URL parse error:", err);
    throw err;
  }
};

const deleteFileFromS3 = async (fileUrlOrKey) => {
  try {
    const Key = fileUrlOrKey.includes("http")
      ? extractFileKey(fileUrlOrKey)
      : fileUrlOrKey;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
    };

    await s3.deleteObject(params).promise();
    console.log("✅ Deleted from S3:", Key);
  } catch (error) {
    console.error("❌ S3 Delete Error:", error);
    throw error;
  }
};

const updateFileInS3 = async (oldFileUrl, newFile) => {
  try {
    const newFileUrl = await uploadFileToS3(newFile);

    if (oldFileUrl) {
      await deleteFileFromS3(oldFileUrl).catch((err) =>
        console.log("Old file deletion failed:", err.message)
      );
    }

    return newFileUrl;
  } catch (error) {
    console.error("S3 Update Error:", error);
    throw error;
  }
};

export { uploadFileToS3, deleteFileFromS3, updateFileInS3 };
