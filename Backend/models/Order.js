const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // NEW: Directly links the order to the shopkeeper who owns the store
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    fulfillmentType: {
      type: String,
      enum: ["PICKUP", "DELIVERY"], // Phase 9 Choice
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED"], // Phase 10 & 11 Workflow
      default: "PENDING",
    },
    deliveryAddress: { type: String, default: "" },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_DELIVERY", "UPI_RAZORPAY", "STRIPE"],
      default: "CASH_ON_DELIVERY"
    },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);