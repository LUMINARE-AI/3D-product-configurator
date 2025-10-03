import mongoose, { Schema } from "mongoose";

const customizationSchema = new Schema({
  partName: { type: String, required: true },
  color: { type: String, required: true },
});

const productSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    modelFile: {
      type: String,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: true,
    },
    customizations: [customizationSchema], // For temporary studio customizations
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);