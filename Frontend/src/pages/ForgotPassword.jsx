import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [inputVal, setInputVal] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [targetEmail, setTargetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Step 1: Send Request for OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      setError("Please enter your registered email address or phone number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await axiosClient.post("/auth/forgot-password", {
        identifier: inputVal.trim(),
        email: inputVal.trim(), // Send under both keys for fail-safe compatibility
        countryCode,
      });

      if (res.data.success) {
        setTargetEmail(res.data.email);
        setMessage(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Make sure an account exists.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.post("/auth/reset-password", {
        email: targetEmail,
        otp: otp.trim(),
        newPassword,
      });

      if (res.data.success) {
        alert("Password updated successfully! Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Reset Password</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          {step === 1
            ? "Enter your registered Email or Mobile Number to receive an OTP."
            : `Enter the 6-digit OTP code sent to ${targetEmail}`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-sm font-bold text-gray-700"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇨🇦 / 🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>

                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  required
                  placeholder="name@example.com or 9876543210"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:bg-emerald-400"
            >
              {loading ? "Sending Verification OTP..." : "Send Verification OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">6-Digit OTP Code</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="123456"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl tracking-widest text-center text-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:bg-emerald-400"
            >
              {loading ? "Updating..." : "Reset Password & Sign In"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
          Remembered your password?{" "}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}