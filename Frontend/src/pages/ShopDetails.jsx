import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useCart } from "../context/CartContext";

export default function ShopDetails() {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      let query = `/products/shop/${shopId}`;
      if (search) query += `?search=${search}`;

      const res = await axiosClient.get(query);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("Failed to load store inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopProducts();
  }, [shopId]);

  return (
    <div className="bg-gray-50 min-h-[90vh] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/shops" className="text-blue-600 font-semibold hover:underline mb-6 inline-block">
          ← Back to All Stores
        </Link>

        {/* Store Catalog Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🛍️ Store Catalog</h1>
          <p className="text-gray-600 text-sm mt-1">
            Browsing available stock from this selected merchant.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); fetchShopProducts(); }} className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Search items in this shop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading catalog...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products available in this store currently.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-3">
                      No Image
                    </div>
                  )}
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{p.name}</h3>
                  <p className="text-lg font-extrabold text-emerald-600 mt-1">
                    ₹{p.price.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stockQuantity <= 0}
                  className={`mt-4 w-full py-2 px-4 rounded-xl font-bold transition-colors ${
                    p.stockQuantity > 0
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {p.stockQuantity > 0 ? "Add to Cart 🛒" : "Out of Stock"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}