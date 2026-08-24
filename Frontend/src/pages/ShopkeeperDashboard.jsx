import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function ShopkeeperDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);

  // New Product State
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stockQuantity: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  // Load shopkeeper's incoming orders
  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get("/orders/shopkeeper");
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  // Load products saved by THIS shopkeeper
  const fetchMyProducts = async () => {
    if (!user?._id) return;
    try {
      const res = await axiosClient.get(`/products/shop/${user._id}`);
      if (res.data.success) setMyProducts(res.data.products);
    } catch (err) {
      console.error("Failed to load saved products:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMyProducts();
  }, [user]);

  // ➕ Add New Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("price", newProduct.price);
      formData.append("stockQuantity", newProduct.stockQuantity);
      formData.append("description", newProduct.description);

      if (imageFile) formData.append("image", imageFile);

      const res = await axiosClient.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Product saved and published to your store!");
        setNewProduct({ name: "", category: "", price: "", stockQuantity: "", description: "" });
        setImageFile(null);
        fetchMyProducts(); // Refresh list immediately
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload product.");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit Product Handler
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", editingProduct.name);
      formData.append("category", editingProduct.category);
      formData.append("price", editingProduct.price);
      formData.append("stockQuantity", editingProduct.stockQuantity);
      formData.append("description", editingProduct.description);

      if (editImageFile) formData.append("image", editImageFile);

      const res = await axiosClient.put(`/products/${editingProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Product updated successfully!");
        setEditingProduct(null);
        setEditImageFile(null);
        fetchMyProducts(); // Refresh list immediately
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete Product Handler
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product from your store?")) return;

    try {
      const res = await axiosClient.delete(`/products/${productId}`);
      if (res.data.success) {
        alert("Product removed successfully.");
        fetchMyProducts(); // Refresh list immediately
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await axiosClient.patch(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update order status.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        
        <h1 className="text-3xl font-extrabold text-gray-900">🏪 Shopkeeper Store Management</h1>

        {/* SECTION 1: ADD NEW PRODUCT */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Add New Item to Store</h2>
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">{error}</p>}

          <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name (e.g. Fortune Rice 5kg)"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-xl"
            />

            <input
              type="text"
              placeholder="Category (e.g. Grocery, Dairy)"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-xl"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price (₹)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-xl"
            />

            <input
              type="number"
              placeholder="Stock Quantity"
              value={newProduct.stockQuantity}
              onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-xl"
            />

            <textarea
              placeholder="Product Description (optional)"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-xl"
              rows="2"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Product Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              {loading ? "Saving & Uploading..." : "Upload Product to Store"}
            </button>
          </form>
        </section>

        {/* SECTION 2: SAVED PRODUCTS LIST */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">📦 Your Saved Store Products</h2>
            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {myProducts.length} Items Listed
            </span>
          </div>

          {myProducts.length === 0 ? (
            <p className="text-gray-500">You haven't added any products yet. Use the form above to list your first item!</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {myProducts.map((p) => (
                <div key={p._id} className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover rounded-xl mb-3" />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-3">No Image</div>
                    )}
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{p.category}</span>
                    <h3 className="font-bold text-gray-900 mt-1">{p.name}</h3>
                    <p className="text-lg font-extrabold text-emerald-600 mt-1">₹{p.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Available Stock: <strong>{p.stockQuantity} units</strong></p>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EDIT PRODUCT MODAL */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Edit Product: {editingProduct.name}</h3>
                <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">×</button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name:</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category:</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price (₹):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Quantity:</label>
                    <input
                      type="number"
                      value={editingProduct.stockQuantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description:</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Replace Image (Optional):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImageFile(e.target.files[0])}
                    className="block w-full text-xs text-gray-500"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECTION 3: INCOMING ORDERS */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🛍️ Incoming Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">No customer orders placed yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900">Order #{order._id.slice(-6)}</h4>
                    <p className="text-sm text-gray-600">Customer: {order.customer?.name} ({order.customer?.email})</p>
                    <p className="text-sm text-gray-600">Fulfillment: <strong>{order.fulfillmentType}</strong> | Total: <strong className="text-emerald-600">₹{order.totalAmount.toFixed(2)}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-600">Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}