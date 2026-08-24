const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// Helper: Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: Format phone number (+91 default)
const formatPhoneNumber = (phone, countryCode = "+91") => {
  if (!phone) return "";
  let cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (!cleaned.startsWith("+")) {
    cleaned = `${countryCode}${cleaned}`;
  }
  return cleaned;
};

// 📩 @desc Send OTP for New Registration
// @route POST /api/auth/send-register-otp
const sendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide an email address." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account already exists with this email address." });
    }

    const otp = generateOtp();

    // Send Registration OTP via Email
    try {
      await sendEmail({
        to: email.toLowerCase(),
        subject: "Verify Your Email - LocalStore India",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #111827;">Welcome to LocalStore India!</h2>
            <p>Your verification code for registration is:</p>
            <h1 style="color: #16a34a; letter-spacing: 4px; font-size: 32px; margin: 15px 0;">${otp}</h1>
            <p style="color: #6b7280; font-size: 12px;">This code expires in 10 minutes.</p>
          </div>
        `,
      });
    } catch (err) {
      console.log(`[Registration OTP Simulator] Code for ${email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${email}`,
      otp, // Sending back so client can verify for demo/testing
    });
  } catch (error) {
    next(error);
  }
};

// 👤 @desc Register a new user
// @route POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, countryCode, shopDetails } = req.body;

    const formattedPhone = formatPhoneNumber(phone, countryCode || "+91");

    if (role === "shopkeeper" && !formattedPhone) {
      return res.status(400).json({ message: "Store owners must provide a valid phone number." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "An account already exists with this email." });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "customer",
      phone: formattedPhone,
      shopDetails,
      isEmailVerified: true,
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        shopDetails: user.shopDetails,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// 🔐 @desc Authenticate user & get token
// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          shopDetails: user.shopDetails,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    next(error);
  }
};

// 🔑 @desc Request Password Reset OTP (Email or Phone)
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    // Accept email, identifier, or phone from req.body
    const identifier = req.body.identifier || req.body.email || req.body.phone;
    const countryCode = req.body.countryCode || "+91";

    if (!identifier) {
      return res.status(400).json({ message: "Please provide an email address or phone number." });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const formattedPhone = formatPhoneNumber(identifier, countryCode);

    // Find account by Email OR Phone Number
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { phone: formattedPhone }],
    });

    if (!user) {
      return res.status(404).json({ message: "No registered account found with this email or phone number." });
    }

    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: otpExpiry,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Code - LocalStore India",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #111827;">Password Reset Request</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Use this OTP code to reset your password:</p>
            <h1 style="color: #16a34a; letter-spacing: 4px; font-size: 32px; margin: 15px 0;">${otp}</h1>
            <p style="color: #6b7280; font-size: 12px;">Valid for 10 minutes.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.log(`[Forgot Password OTP Simulator] OTP for ${user.email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${user.email}`,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// 🔄 @desc Reset Password using OTP
// @route POST /api/auth/reset-password
const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Please provide email, OTP code, and new password." });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP code." });
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful! You can now sign in." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRegistrationOtp,
  registerUser,
  loginUser,
  forgotPassword,
  resetPasswordWithOtp,
};