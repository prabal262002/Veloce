import { Link, useNavigate } from 'react-router-dom';
import useShop from '../context/useShop';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg';

export default function Wishlist() {
  const navigate = useNavigate();
  const { products, loading, error, wishlist, cart, addToCart, toggleWishlist } = useShop();
  const savedProducts = wishlist
    .map((productId) => products.find((product) => String(product._id) === String(productId)))
    .filter(Boolean);

  const handleProductAction = (product) => {
    const inCart = cart.some((item) => String(item.productId) === String(product._id));
    if (inCart) {
      navigate('/checkout');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="wishlist-page">
      <section className="wishlist-shell" aria-labelledby="wishlist-title">
        <div className="wishlist-header">
          <div>
            <p className="featured-products__eyebrow">VELOCE / SAVED GEAR</p>
            <h1 id="wishlist-title">Your wishlist</h1>
            <p>{savedProducts.length} {savedProducts.length === 1 ? 'item' : 'items'} saved for later</p>
          </div>
          <Link className="product-details__link" to="/">Continue shopping</Link>
        </div>

        {loading ? (
          <div className="wishlist-state" role="status">Loading your saved gear...</div>
        ) : error ? (
          <div className="wishlist-state" role="alert">Unable to load your saved gear.</div>
        ) : savedProducts.length === 0 ? (
          <div className="wishlist-empty">
            <span className="wishlist-empty__mark" aria-hidden="true">♡</span>
            <h2>Your list is waiting</h2>
            <p>Save the gear you like and it will be here.</p>
            <Link className="product-card__button product-card__button--primary" to="/">Browse gear</Link>
          </div>
        ) : (
          <div className="wishlist-list">
            {savedProducts.map((product) => {
              const productId = String(product._id);
              const inCart = cart.some((item) => String(item.productId) === productId);
              const outOfStock = Number(product.stock ?? 0) === 0;

              return (
                <article className="wishlist-item" key={productId}>
                  <button
                    type="button"
                    className="wishlist-item__image-button"
                    aria-label={`View ${product.name}`}
                    onClick={() => navigate(`/product/${productId}`)}
                  >
                    <img src={product.images?.[0] || FALLBACK_IMAGE} alt={product.name} />
                  </button>
                  <div className="wishlist-item__details">
                    <p className="product-card__category">{product.category}</p>
                    <button type="button" className="wishlist-item__name" onClick={() => navigate(`/product/${productId}`)}>
                      {product.name}
                    </button>
                    <span className="wishlist-item__stock">{outOfStock ? 'Out of stock' : 'In stock'}</span>
                  </div>
                  <strong className="wishlist-item__price">${Number(product.price).toFixed(2)}</strong>
                  <div className="wishlist-item__actions">
                    <button
                      type="button"
                      className="product-card__button product-card__button--primary"
                      disabled={outOfStock}
                      onClick={() => handleProductAction(product)}
                    >
                      {outOfStock ? 'Out of stock' : inCart ? 'Proceed to checkout' : 'Add to cart'}
                    </button>
                    <button
                      type="button"
                      className="wishlist-item__remove"
                      onClick={() => toggleWishlist(productId)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}