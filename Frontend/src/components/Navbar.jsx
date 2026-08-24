import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <nav style={{ padding: "0.8rem 2rem", backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 }}>
      <div>
        <Link to="/" style={{ color: "#111827", textDecoration: "none", fontSize: "1.3rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🛍️</span> LocalStore India
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <Link to="/" style={{ color: "#4b5563", textDecoration: "none", fontWeight: "500" }}>Home</Link>

        {user ? (
          <>
            {user.role === "shopkeeper" ? (
              <Link to="/dashboard" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>
                Store Dashboard
              </Link>
            ) : (
              <>
                <Link to="/products" style={{ color: "#4b5563", textDecoration: "none", fontWeight: "500" }}>
                  Browse Products
                </Link>
                <Link to="/cart" style={{ color: "#16a34a", textDecoration: "none", fontWeight: "600", backgroundColor: "#f0fdf4", padding: "0.4rem 0.8rem", borderRadius: "6px" }}>
                  Cart 🛒 ({cart.reduce((a, b) => a + b.quantity, 0)})
                </Link>
              </>
            )}

            <span style={{ fontSize: "0.9rem", color: "#6b7280", paddingLeft: "0.5rem", borderLeft: "1px solid #e5e7eb" }}>
              {user.name}
            </span>

            <button
              onClick={() => { logout(); navigate("/login"); }}
              style={{ padding: "0.4rem 0.9rem", backgroundColor: "#ef4444", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#374151", textDecoration: "none", fontWeight: "600", padding: "0.4rem 0.8rem" }}>
              Login
            </Link>
            <Link to="/register" style={{ backgroundColor: "#16a34a", color: "#ffffff", textDecoration: "none", fontWeight: "600", padding: "0.5rem 1rem", borderRadius: "6px" }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}