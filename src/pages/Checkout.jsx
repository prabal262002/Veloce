import { Link } from 'react-router-dom';
import useShop from '../context/useShop';

export default function Checkout() {
  const { cart, products, addToCart, decrementCartQuantity } = useShop();

  const items = cart
    .map((item) => {
      const product = products.find((entry) => String(entry._id) === String(item.productId));
      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: Number(product.price) * Number(item.quantity),
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-header">
           <div>
            <p className="featured-products__eyebrow">VELOCE / CHECKOUT</p>
            <h1>Review your order</h1>
          </div>
          <Link className="product-details__link" to="/">Continue shopping</Link>
        </div>

        {items.length === 0 ? (
          <div className="checkout-empty">
            <p>Your cart is empty.</p>
            <Link className="product-card__button product-card__button--primary checkout-empty__button" to="/">
              Browse gear
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-items">
              {items.map((item) => (

                <div key={item._id} className="checkout-item">
                  <img src={item.images?.[0] || 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg'} alt={item.name} />
                  <div className="checkout-item__details">
                    <p className="checkout-item__category">{item.category}</p>
                    <h2>{item.name}</h2>
                    <div className="checkout-quantity" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        className="checkout-quantity__button"
                        aria-label={item.quantity === 1 ? `Remove ${item.name} from cart` : `Decrease quantity of ${item.name}`}
                        onClick={() => decrementCartQuantity(item)}
                      >
                        −
                      </button>
                      <span className="checkout-quantity__value" aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        className="checkout-quantity__button"
                        aria-label={`Increase quantity of ${item.name}`}
                        disabled={Number(item.quantity) >= Number(item.stock ?? 0)}
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <strong>${Number(item.lineTotal).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <aside className="checkout-summary">
              <h2>Order summary</h2>
              <div className="checkout-summary__row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="checkout-summary__row">
                <span>Shipping</span>
                <strong>Free</strong>
              </div>
              <div className="checkout-summary__row checkout-summary__row--total">
                <span>Total</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <button type="button" className="product-card__button product-card__button--primary checkout-summary__button">
                Place order
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
