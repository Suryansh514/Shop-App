const express = require("express");
const router = express.Router();
const {
  sendRegistrationOtp,
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordWithOtp,
} = require("../controllers/authController");

router.post("/send-register-otp", sendRegistrationOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithOtp);

module.exports = router;