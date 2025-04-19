import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stripePaymentIntentId: { type: String, required: true },
    stripeCustomerId: { type: String }, // save customers
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentMethod: { type: String }, // card, wallet, etc.
    status: {
      type: String,
      enum: [
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "processing",
        "succeeded",
        "canceled"
      ],
      default: "processing"
    },
    receiptUrl: { type: String }, // Stripe provides a receipt URL
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment