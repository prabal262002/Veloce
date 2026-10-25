import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useShop from "../context/useShop";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? "/api"
  : "https://veloce-be-nine.vercel.app");

function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export default function Orders() {
  const { authReady, isLoggedIn } = useShop();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!authReady || !isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders`, { credentials: "include" });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Unable to fetch your orders.");
        }
        if (active) setOrders(result.orders || []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to fetch your orders.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, [authReady, isLoggedIn]);

  if (!authReady || loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell"><div className="checkout-empty" role="status">Loading orders...</div></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <p>Sign in to view your orders.</p>
            <Link className="product-details__link" to="/">Continue shopping</Link>
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
            <p className="featured-products__eyebrow">VELOCE / ACCOUNT</p>
            <h1>Your orders</h1>
          </div>
          <Link className="product-details__link" to="/profile">My profile</Link>
        </div>
        {error ? (
          <p className="checkout-cart-error" role="alert">{error}</p>
        ) : orders.length === 0 ? (
          <div className="checkout-empty">
            <p>You haven’t placed any orders yet.</p>
            <Link className="product-card__button product-card__button--primary checkout-empty__button" to="/">
              Browse gear
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link className="orders-list__item" to={`/orders/${order._id}`} key={order._id}>
                <div>
                  <span className="featured-products__eyebrow">{order.orderNumber}</span>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  <small>{order.items.length} {order.items.length === 1 ? "item" : "items"} · {order.status}</small>
                </div>
                <strong>{formatPrice(order.total)}</strong>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
