const express = require("express");
const router = express.Router();
const { createOrder, getShopkeeperOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/auth");

router.post("/", protect, authorizeRoles("customer"), createOrder);
router.get("/shopkeeper", protect, authorizeRoles("shopkeeper"), getShopkeeperOrders);
router.patch("/:id/status", protect, authorizeRoles("shopkeeper"), updateOrderStatus);

module.exports = router;