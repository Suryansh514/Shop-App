const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getShops,
  getProductsByShop,
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public endpoints
router.get("/", getProducts);
router.get("/shops", getShops); // 🏪 Get list of all shops
router.get("/shop/:shopkeeperId", getProductsByShop); // 🛍️ Get items for 1 shop

// Protected shopkeeper endpoint
router.post(
  "/",
  protect,
  authorizeRoles("shopkeeper"),
  upload.single("image"),
  createProduct
);

module.exports = router;