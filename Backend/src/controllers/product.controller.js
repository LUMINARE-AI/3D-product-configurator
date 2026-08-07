import { Product } from "../models/product.model.js";
import {
  uploadFileToS3,
  deleteFileFromS3,
  updateFileInS3,
} from "../utils/aws-sdk.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, projectId } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  if (!req.files || !req.files.modelFile || !req.files.coverImageURL) {
    throw new ApiError(400, "Model file and cover image are required");
  }

  const existing = await Product.findOne({ name });
  if (existing) {
    throw new ApiError(400, "Product with this name already exists");
  }

  let modelFile, coverImageUrl;
  try {
    modelFile = await uploadFileToS3(req.files.modelFile[0]);
    coverImageUrl = await uploadFileToS3(req.files.coverImageURL[0]);
  } catch (err) {
    console.error("S3 Upload Error:", err);
    throw new ApiError(500, "File upload failed");
  }

  const product = await Product.create({
    projectId: projectId || null,
    name,
    description,
    modelFile: modelFile.url,
    coverImageURL: coverImageUrl.url,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.modelFile) {
    await deleteFileFromS3(product.modelFile);
  }
  if (product.coverImageURL) {
    await deleteFileFromS3(product.coverImageURL);
  }

  await Product.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

const saveCustomizations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { partName, color } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const existingCustomization = product.customizations.find(
    (c) => c.partName === partName
  );

  if (existingCustomization) {
    existingCustomization.color = color;
  } else {
    product.customizations.push({ partName, color });
  }

  await product.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        productId: id,
        customizations: product.customizations,
      },
      "Customization saved"
    )
  );
});

const getCustomizations = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, product.customizations, "Customizations fetched")
    );
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  if (name) product.name = name;
  if (description) product.description = description;

  if (req.files?.modelFile?.[0]) {
    const result = await updateFileInS3(
      product.modelFile,
      req.files.modelFile[0]
    );
    product.modelFile = result.url || result;
  }

  if (req.files?.coverImageURL?.[0]) {
    const result = await updateFileInS3(
      product.coverImageURL,
      req.files.coverImageURL[0]
    );
    product.coverImageURL = result.url || result;
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  saveCustomizations,
  getCustomizations,
  updateProduct,
};
