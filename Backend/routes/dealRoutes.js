const express = require("express");
const router = express.Router();
const { getDeals, createDeal } = require("../controllers/dealController");
const { protect, authorizeRoles } = require("../middleware/auth");

router.get("/", getDeals);
router.post("/", protect, authorizeRoles("shopkeeper"), createDeal);

module.exports = router;