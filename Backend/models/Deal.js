const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    validUntil: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);