import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-semibold text-sm mb-6 border border-blue-100">
            🇮🇳 Built for Indian Kirana & Local Stores
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Empowering Local Kiranas & Direct Customer Ordering
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Connect local shopkeepers with neighborhood customers. Browse nearby stores, view real-time inventory, place advance orders, and pay with UPI!
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                Register Free
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300 rounded-xl transition-colors"
              >
                Sign In to Account
              </Link>
            </div>
          ) : (
            <Link
              to={user.role === "shopkeeper" ? "/dashboard" : "/shops"}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors inline-block"
            >
              Go to Your Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
          Why LocalStore India?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">For Customers</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse inventory at your nearest local shops, skip long store queues, select delivery or pickup, and pay via UPI instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">For Shopkeepers</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload product photos from your phone, receive instant push notifications for orders, and expand your local customer base.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-4xl mb-4">📲</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Indian Payments</h3>
            <p className="text-gray-600 leading-relaxed">
              Integrated with Razorpay for GPay, PhonePe, Paytm, RuPay, Netbanking, and Cash on Delivery options.
            </p>
          </div>
        </div>
      </section>

      {/* Shopkeeper Pricing Section */}
      <section className="bg-white py-16 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Transparent Shopkeeper Memberships
          </h2>
          <p className="text-gray-600 mb-12">
            Affordable plans designed to empower local Indian business owners.
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* Monthly Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 bg-gray-50 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Monthly Plan</h3>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-gray-900">₹120</span>
                  <span className="text-gray-500"> / month</span>
                </div>
                <ul className="space-y-3 text-gray-600 mb-8">
                  <li className="flex items-center gap-2">✅ Full Store & Catalog Listing</li>
                  <li className="flex items-center gap-2">✅ Real-Time FCM Order Alerts</li>
                  <li className="flex items-center gap-2">✅ Cloudinary Photo Uploads</li>
                  <li className="flex items-center gap-2">✅ Unlimited Customer Orders</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                Start Monthly Plan
              </Link>
            </div>

            {/* Annual Plan */}
            <div className="border-2 border-emerald-600 rounded-2xl p-8 bg-white shadow-lg relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Best Value
              </span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Annual Plan</h3>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-gray-900">₹1,200</span>
                  <span className="text-gray-500"> / year</span>
                </div>
                <ul className="space-y-3 text-gray-600 mb-8">
                  <li className="flex items-center gap-2">✅ All Monthly Features Included</li>
                  <li className="flex items-center gap-2">✅ Featured Priority Listing</li>
                  <li className="flex items-center gap-2">✅ Zero Commission per Sale</li>
                  <li className="flex items-center gap-2">✅ Direct Support</li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
              >
                Get Annual Plan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}