const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const admin = require("../config/firebase");

// @desc    Create Order & Notify Shopkeeper via FCM
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { items, fulfillmentType, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let totalAmount = 0;
    const orderItems = [];
    let targetShopkeeperId = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product ? product.name : item.product}`,
        });
      }

      if (!targetShopkeeperId) {
        targetShopkeeperId = product.shopkeeper;
      }

      product.stockQuantity -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await Order.create({
      customer: req.user._id,
      shopkeeper: targetShopkeeperId,
      items: orderItems,
      totalAmount,
      fulfillmentType,
      deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : "",
      paymentMethod,
    });

    // 🔔 SEND FCM PUSH NOTIFICATION TO SHOPKEEPER
    try {
      const shopkeeperUser = await User.findById(targetShopkeeperId);
      if (shopkeeperUser && shopkeeperUser.fcmToken) {
        const message = {
          notification: {
            title: "🛍️ New Order Received!",
            body: `Order #${order._id.toString().slice(-6)} placed for $${totalAmount.toFixed(2)} (${fulfillmentType})`,
          },
          data: {
            orderId: order._id.toString(),
            type: "NEW_ORDER",
          },
          token: shopkeeperUser.fcmToken,
        };

        await admin.messaging().send(message);
        console.log("[FCM] Push notification sent to shopkeeper!");
      }
    } catch (fcmErr) {
      console.error("[FCM Error - Shopkeeper Notification]:", fcmErr.message);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Shopkeeper Orders
// @route   GET /api/orders/shopkeeper
const getShopkeeperOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ shopkeeper: req.user._id })
      .populate("customer", "name email phone")
      .populate("items.product", "name price imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Order Status & Notify Customer via FCM
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.shopkeeper.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order." });
    }

    order.status = status;
    await order.save();

    // 🔔 SEND FCM PUSH NOTIFICATION TO CUSTOMER
    try {
      const customerUser = await User.findById(order.customer);
      if (customerUser && customerUser.fcmToken) {
        const message = {
          notification: {
            title: "📦 Order Update!",
            body: `Your order #${order._id.toString().slice(-6)} status is now: ${status}`,
          },
          data: {
            orderId: order._id.toString(),
            status,
          },
          token: customerUser.fcmToken,
        };

        await admin.messaging().send(message);
        console.log("[FCM] Push notification sent to customer!");
      }
    } catch (fcmErr) {
      console.error("[FCM Error - Customer Notification]:", fcmErr.message);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getShopkeeperOrders,
  updateOrderStatus,
};