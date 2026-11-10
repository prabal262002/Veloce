import { Link } from 'react-router-dom';
import useShop from '../context/useShop';
import { formatProductCategory } from '../utils/productCategories';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg';

export default function Cart() {
  const {
    cart,
    products,
    loading,
    error,
    cartError,
    wishlist,
    addToCart,
    decrementCartQuantity,
    removeFromCart,
    toggleWishlist,
  } = useShop();

  const items = cart
    .map((item) => {
      const product = products.find(
        (entry) => String(entry._id) === String(item.productId),
      );
      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: Number(product.price) * Number(item.quantity),
      };
    })
    .filter(Boolean);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-header">
          <div>
            <p className="featured-products__eyebrow">VELOCE / YOUR GEAR</p>
            <h1>Your cart</h1>
          </div>
          <Link className="product-details__link" to="/">
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="checkout-empty" role="status">Loading your cart...</div>
        ) : error ? (
          <div className="checkout-empty" role="alert">
            <p>Unable to load your cart: {error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="checkout-empty">
            <p>Your cart is empty.</p>
            <Link
              className="product-card__button product-card__button--primary checkout-empty__button"
              to="/"
            >
              Browse gear
            </Link>
          </div>
        ) : (
          <div className="checkout-layout cart-layout">
            <section className="checkout-items" aria-label="Items in your cart">
              {cartError && <p className="checkout-cart-error" role="alert">{cartError}</p>}
              {items.map((item) => {
                const isInWishlist = wishlist.includes(String(item._id));
                return (
                  <div key={item._id} className="checkout-item">
                    <img src={item.images?.[0] || FALLBACK_IMAGE} alt={item.name} />
                    <div className="checkout-item__details">
                      <p className="checkout-item__category">{formatProductCategory(item.category)}</p>
                      <h2>{item.name}</h2>
                      <p className="cart-item__unit-price">
                        ${Number(item.price).toFixed(2)} each
                      </p>
                      <div className="checkout-quantity" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          className="checkout-quantity__button"
                          aria-label={item.quantity === 1
                            ? `Remove ${item.name} from cart`
                            : `Decrease quantity of ${item.name}`}
                          onClick={() => decrementCartQuantity(item)}
                        >
                          −
                        </button>
                        <span className="checkout-quantity__value" aria-live="polite">
                          {item.quantity}
                        </span>
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
                      <div className="checkout-item__actions">
                        <button
                          type="button"
                          className="checkout-item__action"
                          onClick={() => {
                            if (!isInWishlist) toggleWishlist(item._id);
                            removeFromCart(item);
                          }}
                        >
                          Move to wishlist
                        </button>
                        <button
                          type="button"
                          className="checkout-item__action checkout-item__action--remove"
                          onClick={() => removeFromCart(item)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <strong>${Number(item.lineTotal).toFixed(2)}</strong>
                  </div>
                );
              })}
            </section>

            <aside className="checkout-summary">
              <h2>Cart summary</h2>
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
              <Link
                to="/checkout"
                className="product-card__button product-card__button--primary checkout-summary__button"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
