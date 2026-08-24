import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Register() {
  const [step, setStep] = useState(1); // Step 1: Account Info & OTP Request, Step 2: Verify OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    countryCode: "+91",
    shopName: "",
    address: "",
  });

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Step 1: Request Registration OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.post("/auth/send-register-otp", {
        email: formData.email,
      });

      if (res.data.success) {
        if (res.data.otp) setGeneratedOtp(res.data.otp);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Submit Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Validate OTP
      if (generatedOtp && otp.trim() !== generatedOtp.trim()) {
        setError("Invalid OTP code. Please check and try again.");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        countryCode: formData.countryCode,
        shopDetails:
          formData.role === "shopkeeper"
            ? { shopName: formData.shopName, address: formData.address }
            : undefined,
      };

      await register(payload);
      navigate(formData.role === "shopkeeper" ? "/dashboard" : "/shops");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Create Account</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          {step === 1
            ? "Enter your details to register as a Customer or Shopkeeper"
            : `Enter the 6-digit OTP code sent to ${formData.email}`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Account Type</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="customer">Customer (Buy from local shops)</option>
                <option value="shopkeeper">Shopkeeper (Sell & manage inventory)</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mobile Phone Number {formData.role === "shopkeeper" && <span className="text-red-500">* (Required)</span>}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-sm font-bold text-gray-700"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇨🇦 / 🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>

                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required={formData.role === "shopkeeper"}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {formData.role === "shopkeeper" && (
              <>
                <input
                  type="text"
                  placeholder="Shop Name (e.g. Gupta General Store)"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Store Address / Locality"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:bg-emerald-400"
            >
              {loading ? "Sending Verification OTP..." : "Get Verification OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Enter 6-Digit OTP</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:bg-emerald-400"
            >
              {loading ? "Verifying..." : "Verify OTP & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
            >
              ← Edit Details
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-4">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}