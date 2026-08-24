const User = require("../models/User");
const Product = require("../models/Product");

// @desc    Create a new product (with optional Cloudinary file upload)
// @route   POST /api/products
// @access  Private (Shopkeeper only)
const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stockQuantity, description, imageUrl } = req.body;

    // If a file was uploaded via Multer, use req.file.path (Cloudinary URL)
    const finalImageUrl = req.file ? req.file.path : imageUrl || "";

    const product = await Product.create({
      shopkeeper: req.user._id,
      name,
      category,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      description: description || "",
      imageUrl: finalImageUrl,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered shopkeepers (Stores Directory)
// @route   GET /api/products/shops
// @access  Public
const getShops = async (req, res, next) => {
  try {
    const shops = await User.find({ role: "shopkeeper" }).select(
      "name email phone shopDetails"
    );

    res.status(200).json({ success: true, count: shops.length, shops });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products belonging to a specific shopkeeper
// @route   GET /api/products/shop/:shopkeeperId
// @access  Public
const getProductsByShop = async (req, res, next) => {
  try {
    const { shopkeeperId } = req.params;
    const { search, category } = req.query;

    let query = { shopkeeper: shopkeeperId };

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getShops,
  getProductsByShop,
};