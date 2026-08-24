const Deal = require("../models/Deal");

const getDeals = async (req, res, next) => {
  try {
    const deals = await Deal.find().populate("product");
    res.status(200).json({ success: true, count: deals.length, deals });
  } catch (error) {
    next(error);
  }
};

const createDeal = async (req, res, next) => {
  try {
    const { title, discountPercentage, product, validUntil } = req.body;
    const deal = await Deal.create({ title, discountPercentage, product, validUntil });
    res.status(201).json({ success: true, deal });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDeals, createDeal };