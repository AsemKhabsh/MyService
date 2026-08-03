import mongoose from "mongoose";
import { REQUEST_STATUSES, PAYMENT_STATUSES } from "@/utils/constants";

const StatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const RequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "Pending",
    },
    customerMessage: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Request price is required"],
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: function () {
        return [
          {
            status: "Pending",
            note: "Service request created",
            createdAt: new Date(),
          },
        ];
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);
