import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { addToCart } = useCart();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = "/products?";
      if (search) query += `search=${search}&`;
      if (category) query += `category=${category}`;

      const res = await axiosClient.get(query);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Store Products</h2>

      {/* Search and Category Filter Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Filter by Category (e.g. Produce)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Search
        </button>
      </form>

      {loading && <p>Loading catalog...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Product Grid */}
      {!loading && products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "150px", backgroundColor: "#eee", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#777" }}>
                    No Image
                  </div>
                )}
                <h3 style={{ margin: "0.5rem 0 0.2rem 0" }}>{product.name}</h3>
                <p style={{ color: "#666", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
                  Category: {product.category}
                </p>
                <p style={{ fontWeight: "bold", fontSize: "1.1rem", margin: "0.5rem 0" }}>
                  ${product.price.toFixed(2)}
                </p>
                <p style={{ fontSize: "0.85rem", color: product.stockQuantity > 0 ? "green" : "red" }}>
                  {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
                </p>
              </div>

              <button
                onClick={() => addToCart(product)}
                disabled={product.stockQuantity <= 0}
                style={{
                  marginTop: "1rem",
                  padding: "0.6rem",
                  backgroundColor: product.stockQuantity > 0 ? "#28a745" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: product.stockQuantity > 0 ? "pointer" : "not-allowed",
                }}
              >
                {product.stockQuantity > 0 ? "Add to Cart" : "Sold Out"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}