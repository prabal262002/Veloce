import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useShop from "../context/useShop";
import { formatProductCategory } from "../utils/productCategories";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? "/api"
  : "https://veloce-be-nine.vercel.app");

function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { authReady, isLoggedIn } = useShop();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!authReady || !isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, { credentials: "include" });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to fetch this order.");
        }
        if (active) setOrder(result.order);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to fetch this order.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      active = false;
    };
  }, [authReady, isLoggedIn, orderId]);

  if (!authReady || loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell"><div className="checkout-empty" role="status">Loading your order...</div></div>
      </div>
    );
  }

  if (!isLoggedIn || error || !order) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <p>{error || "Sign in to view this order."}</p>
            <Link className="product-details__link" to="/orders">Back to orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-header">
          <div>
            <p className="featured-products__eyebrow">ORDER CONFIRMED</p>
            <h1>Thanks for your order.</h1>
            <p className="checkout-confirmation__number">{order.orderNumber}</p>
          </div>
          <Link className="product-details__link" to="/orders">Order history</Link>
        </div>

        <div className="checkout-layout checkout-confirmation">
          <section className="checkout-items">
            <h2>Order items</h2>
            {order.items.map((item) => (
              <div className="checkout-item" key={String(item.productId)}>
                {item.image && <img src={item.image} alt="" />}
                <div className="checkout-item__details">
                  <p className="checkout-item__category">{formatProductCategory(item.category)}</p>
                  <h2>{item.name}</h2>
                  <p>Quantity: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                </div>
                <strong>{formatPrice(item.lineTotal)}</strong>
              </div>
            ))}
          </section>

          <aside className="checkout-summary">
            <h2>Delivery &amp; payment</h2>
            <div className="checkout-address__details">
              <strong>{order.shippingAddress.fullName}</strong>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            <p className="checkout-payment-note">Cash on delivery · {order.status}</p>
            <div className="checkout-summary__row">
              <span>Subtotal</span><strong>{formatPrice(order.subtotal)}</strong>
            </div>
            {order.discountAmount > 0 && (
              <div className="checkout-summary__row checkout-summary__row--discount">
                <span>Discount ({order.discountCode})</span>
                <strong>−{formatPrice(order.discountAmount)}</strong>
              </div>
            )}
            <div className="checkout-summary__row">
              <span>Shipping</span><strong>Free</strong>
            </div>
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total due</span><strong>{formatPrice(order.total)}</strong>
            </div>
          </aside>
        </div>
        <Link className="product-details__link checkout-confirmation__continue" to="/">Continue shopping</Link>
      </div>
    </div>
  );
}
