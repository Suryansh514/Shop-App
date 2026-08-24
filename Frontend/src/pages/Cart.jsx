import { useState } from "react";
import { useCart } from "../context/CartContext";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [fulfillmentType, setFulfillmentType] = useState("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI_RAZORPAY"); // Default to UPI/Razorpay
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        items: cart.map((i) => ({ product: i.product, quantity: i.quantity })),
        fulfillmentType,
        deliveryAddress: fulfillmentType === "DELIVERY" ? deliveryAddress : "",
        paymentMethod,
      };

      if (paymentMethod === "UPI_RAZORPAY") {
        // Trigger Razorpay Modal
        const options = {
          key: "rzp_test_YourKeyHere", // Replace with your Razorpay Test Key
          amount: Math.round(totalAmount * 100), // Convert ₹ to paise
          currency: "INR",
          name: "LocalStore India",
          description: "Payment for Kirana Order",
          handler: async function (response) {
            // Upon successful Razorpay payment
            const finalPayload = { ...payload, paymentId: response.razorpay_payment_id };
            const res = await axiosClient.post("/orders", finalPayload);
            if (res.data.success) {
              setSuccess("Payment Successful! Order placed.");
              clearCart();
              setTimeout(() => navigate("/products"), 2000);
            }
          },
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9876543210",
          },
          theme: { color: "#16a34a" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // Cash / Pay on Delivery Option
        const res = await axiosClient.post("/orders", payload);
        if (res.data.success) {
          setSuccess("Order placed successfully! Pay on delivery.");
          clearCart();
          setTimeout(() => navigate("/products"), 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order placement failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "90vh", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", padding: "2rem", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h2 style={{ color: "#111827", marginBottom: "1.5rem" }}>Shopping Cart 🛒</h2>

        {error && <p style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "0.8rem", borderRadius: "6px" }}>{error}</p>}
        {success && <p style={{ color: "#16a34a", backgroundColor: "#f0fdf4", padding: "0.8rem", borderRadius: "6px" }}>{success}</p>}

        {cart.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Your cart is empty.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item.product} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", padding: "1rem 0" }}>
                <div>
                  <h4 style={{ margin: 0, color: "#1f2937" }}>{item.name}</h4>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>₹{item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontWeight: "bold", color: "#111827" }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.product)} style={{ padding: "0.3rem 0.6rem", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "4px", cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div style={{ textAlign: "right", margin: "1.5rem 0", fontSize: "1.3rem", fontWeight: "800", color: "#111827" }}>
              Total Amount: ₹{totalAmount.toFixed(2)}
            </div>

            <form onSubmit={handleCheckout} style={{ borderTop: "2px solid #f3f4f6", paddingTop: "1.5rem" }}>
              <h3 style={{ color: "#374151", marginBottom: "1rem" }}>Fulfillment & Indian Payment Options</h3>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", color: "#4b5563" }}>Fulfillment Mode:</label>
                <select value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                  <option value="PICKUP">In-Store Pickup (Store Visit)</option>
                  <option value="DELIVERY">Home Delivery</option>
                </select>
              </div>

              {fulfillmentType === "DELIVERY" && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", color: "#4b5563" }}>Full Delivery Address:</label>
                  <input type="text" placeholder="House/Flat No, Street, Landmark, Pin Code" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                </div>
              )}

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", color: "#4b5563" }}>Payment Method:</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                  <option value="UPI_RAZORPAY">Online UPI (GPay, PhonePe, Paytm, Cards, Netbanking)</option>
                  <option value="CASH_ON_DELIVERY">Cash / Pay on Delivery</option>
                </select>
              </div>

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }}>
                {loading ? "Processing..." : `Proceed to Pay ₹${totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}