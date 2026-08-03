import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    stripePaymentIntent: {
      type: String,
      required: true,
      index: true,
    },
    stripeEventId: {
      type: String,
      default: "",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Succeeded", "Failed", "Refunded"],
      default: "Pending",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
