import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axiosClient.get("/products/shops");
        if (res.data.success) {
          setShops(res.data.shops);
        }
      } catch (err) {
        console.error("Failed to load shops:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading nearby stores...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-[90vh] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          🏪 Nearby Kirana & Local Stores
        </h1>
        <p className="text-gray-600 mb-8">
          Select a local shop to view their catalog, fresh inventory, and place direct orders.
        </p>

        {shops.length === 0 ? (
          <p className="text-gray-500">No shopkeepers registered yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop._id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {shop.shopDetails?.shopName || shop.name}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        shop.shopDetails?.isAcceptingOrders
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {shop.shopDetails?.isAcceptingOrders ? "Open" : "Closed"}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">
                    📍 {shop.shopDetails?.address || "Local Neighborhood"}
                  </p>
                  <p className="text-gray-500 text-xs mb-1">
                    🕒 Hours: {shop.shopDetails?.openingHours || "9:00 AM - 9:00 PM"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    📞 Contact: {shop.phone || "N/A"}
                  </p>
                </div>

                <Link
                  to={`/shop/${shop._id}`}
                  className="mt-6 w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors block"
                >
                  Visit Store Catalog 🛍️
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}