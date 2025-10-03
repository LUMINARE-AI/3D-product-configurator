// customize.model.js
import mongoose, { Schema } from "mongoose";

const customizeSchema = new Schema(
  {
    baseProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    customizations: [
      {
        partName: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Customize = mongoose.model("Customize", customizeSchema);