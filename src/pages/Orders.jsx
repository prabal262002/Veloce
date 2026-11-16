import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useShop from "../context/useShop";
import API_URL from "../utils/api";

const FALLBACK_ORDER_IMAGE = "https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg";

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
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const itemCount = order.items?.length || 0;

              return (
                <Link
                  className="orders-list__item"
                  to={`/orders/${order._id}`}
                  key={order._id}
                  aria-label={`View order ${order.orderNumber}`}
                >
                  <img
                    className="orders-list__image"
                    src={firstItem?.image || FALLBACK_ORDER_IMAGE}
                    alt={firstItem?.name || "Order item"}
                    loading="lazy"
                  />
                  <div className="orders-list__details">
                    <span className="featured-products__eyebrow">{order.orderNumber}</span>
                    <p className="orders-list__date">
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="orders-list__meta">
                      <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                      <span className={`orders-list__status orders-list__status--${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="orders-list__total">
                    <strong>{formatPrice(order.total)}</strong>
                    <span>View order <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
