import { Customize } from "../models/customize.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new customization
const createCustomization = asyncHandler(async (req, res) => {
  const { baseProductId, name, description, customizations } = req.body;
    // 1. Validate fields
    if (!baseProductId || !name || !description) {
        throw new ApiError(400, "Base product, name and description are required");
    }

    // 2. Check if base product exists
    const baseProduct = await Product.findById(baseProductId);
    if (!baseProduct) {
        throw new ApiError(404, "Base product not found");
    }
    // 3. Create customization entry
    const customization = await Customize.create({
        baseProduct: baseProductId,
        name,
        description,
        customizations: customizations || [],
    });
    return res.status(201).json(new ApiResponse(201, "Customization created successfully", customization));
});

const deleteCustomization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const customization = await Customize.findByIdAndDelete(id);
    if (!customization) {
        throw new ApiError(404, "Customization not found");
    }
    return res.status(200).json(new ApiResponse(200, "Customization deleted successfully"));
}   );

const getAllCustomizations = asyncHandler(async (req, res) => {
    const customizations = await Customize.find().populate('baseProduct');
    return res.status(200).json(new ApiResponse(200, "Customizations fetched successfully", customizations));
});

const getCustomizationById = asyncHandler(async (req, res) => { 
    const { id } = req.params;
    const customization = await Customize.findById(id).populate('baseProduct');
    if (!customization) {
        throw new ApiError(404, "Customization not found");
    }
    return res.status(200).json(new ApiResponse(200, "Customization fetched successfully", customization));
});

export { createCustomization, deleteCustomization, getAllCustomizations, getCustomizationById };