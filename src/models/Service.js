import mongoose from "mongoose";
import { PREDEFINED_CATEGORIES } from "@/utils/constants";

const ServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: PREDEFINED_CATEGORIES,
        message: "{VALUE} is not a valid predefined category",
      },
    },
    image: {
      type: String,
      required: [true, "Main image URL is required"],
    },
    gallery: {
      type: [String],
      default: [],
    },
    deliveryTime: {
      type: Number,
      required: [true, "Delivery time in days is required"],
      min: [1, "Delivery time must be at least 1 day"],
    },
    revisions: {
      type: Number,
      default: 1,
      min: [0, "Revisions cannot be negative"],
    },
    features: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
