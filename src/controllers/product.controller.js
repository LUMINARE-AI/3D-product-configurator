import { Product } from "../models/product.model.js";
import { uploadFileToS3, deleteFileFromS3, updateFileInS3 } from "../utils/aws-sdk.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, projectId } = req.body;

  // 1. Validate fields
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  if (!req.files || !req.files.modelFile || !req.files.coverImageURL) {
    throw new ApiError(400, "Model file and cover image are required");
  }

  // 2. Check duplicate product name
  const existing = await Product.findOne({ name });
  if (existing) {
    throw new ApiError(400, "Product with this name already exists");
  }

  // 3. Upload files to S3
  let modelFile, coverImageUrl;
  try {
    modelFile = await uploadFileToS3(req.files.modelFile[0]);
    coverImageUrl = await uploadFileToS3(req.files.coverImageURL[0]);
  } catch (err) {
    console.error("S3 Upload Error:", err);
    throw new ApiError(500, "File upload failed");
  }

  // 4. Save product in DB
  const product = await Product.create({
    projectId: projectId || null,
    name,
    description,
    modelFile: modelFile.url,
    coverImageURL: coverImageUrl.url,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Product created successfully", product));
});

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete S3 files
    if (product.modelFile) {
      await deleteFileFromS3(product.modelFile);
    }
    if (product.coverImageURL) {
      await deleteFileFromS3(product.coverImageURL);
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: "Product deleted successfully ✅" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Failed to delete product ❌" });
  }
};

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res
    .status(200)
    .json(new ApiResponse(200, "Products fetched successfully", products));
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Product fetched successfully", product));
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err });
  }
});

// Updated: Save temporary customizations (for studio live preview)
const saveCustomizations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { partName, color } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Find existing customization or create new
  const existingCustomization = product.customizations.find(
    c => c.partName === partName
  );

  if (existingCustomization) {
    existingCustomization.color = color;
  } else {
    product.customizations.push({ partName, color });
  }

  await product.save();
  
  return res.status(200).json(
    new ApiResponse(200, "Customization saved", {
      productId: id,
      customizations: product.customizations
    })
  );
});

const getCustomizations = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Customizations fetched", product.customizations)
    );
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Update text fields
  if (name) product.name = name;
  if (description) product.description = description;

  // Handle model file update
  if (req.files?.modelFile?.[0]) {
    const result = await updateFileInS3(
      product.modelFile, 
      req.files.modelFile[0]
    );
    // Extract URL from object
    product.modelFile = result.url || result;
  }

  // Handle cover image update
  if (req.files?.coverImageURL?.[0]) {
    const result = await updateFileInS3(
      product.coverImageURL, 
      req.files.coverImageURL[0]
    );
    // Extract URL from object
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
  updateProduct
};