const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

// Connect to MongoDB Atlas (Phase 4)
connectDB();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/deals", require("./routes/dealRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Base Health Check
app.get("/", (req, res) => {
  res.send("Shop-App Backend API is running successfully!");
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});