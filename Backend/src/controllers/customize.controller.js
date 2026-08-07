import { Customize } from "../models/customize.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createCustomization = asyncHandler(async (req, res) => {
  const { baseProductId, name, description, customizations } = req.body;

  if (!baseProductId || !name || !description) {
    throw new ApiError(
      400,
      "Base product, name and description are required"
    );
  }

  const baseProduct = await Product.findById(baseProductId);
  if (!baseProduct) {
    throw new ApiError(404, "Base product not found");
  }

  const customization = await Customize.create({
    baseProduct: baseProductId,
    createdBy: req.user._id,
    name,
    description,
    customizations: customizations || [],
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, customization, "Customization created successfully")
    );
});

const deleteCustomization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customization = await Customize.findById(id);

  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }

  const isOwner =
    customization.createdBy &&
    customization.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not allowed to delete this customization");
  }

  await customization.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Customization deleted successfully"));
});

const getAllCustomizations = asyncHandler(async (req, res) => {
  const customizations = await Customize.find().populate("baseProduct");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        customizations,
        "Customizations fetched successfully"
      )
    );
});

const getMyCustomizations = asyncHandler(async (req, res) => {
  const customizations = await Customize.find({ createdBy: req.user._id })
    .populate("baseProduct")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        customizations,
        "Your customizations fetched successfully"
      )
    );
});

const getCustomizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customization = await Customize.findById(id).populate("baseProduct");
  if (!customization) {
    throw new ApiError(404, "Customization not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        customization,
        "Customization fetched successfully"
      )
    );
});

export {
  createCustomization,
  deleteCustomization,
  getAllCustomizations,
  getMyCustomizations,
  getCustomizationById,
};
