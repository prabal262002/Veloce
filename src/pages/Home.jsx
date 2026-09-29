import useShop from '../context/useShop';

export default function Home() {
  const {
    products,
    loading,
    error,
    cart,
    wishlist,
    addToCart,
    decrementCartQuantity,
    toggleWishlist,
  } = useShop();
  const featuredProducts = products.slice(0, 3);

  if (loading) {
    return <div className="home-page"><section className="featured-products"><p className="featured-products__eyebrow">Loading products...</p></section></div>;
  }

  if (error) {
    return <div className="home-page"><section className="featured-products"><p className="featured-products__eyebrow">Unable to load products.</p></section></div>;
  }

  return (
    <div className="home-page">
      <section className="featured-products" aria-labelledby="featured-title">
        <div className="featured-products__heading">
          <div>
            <p className="featured-products__eyebrow">VELOCE / RIDER EQUIPMENT</p>
            <h1 id="featured-title">Gear up. Get out.</h1>
            <p className="featured-products__intro">
              Road-ready essentials for every mile ahead.
            </p>
          </div>
          <span className="featured-products__count">FEATURED / {String(featuredProducts.length).padStart(2, '0')}</span>
        </div>

        <div className="product-grid">
          {featuredProducts.map((product, index) => (
            <article className="product-card" key={product._id || product.name}>
              <div className="product-card__image-wrap">
                <img
                  className="product-card__image"
                  src={product.images?.[0] || 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg'}
                  alt={product.name}
                  loading="lazy"
                />
                <span className="product-card__number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className={`product-card__wishlist${wishlist.includes(String(product._id)) ? ' is-active' : ''}`}
                  aria-label={`${wishlist.includes(String(product._id)) ? 'Remove' : 'Add'} ${product.name} ${wishlist.includes(String(product._id)) ? 'from' : 'to'} wishlist`}
                  aria-pressed={wishlist.includes(String(product._id))}
                  onClick={() => toggleWishlist(product._id)}
                >
                  {wishlist.includes(String(product._id)) ? '♥' : '♡'}
                </button>
              </div>
              <div className="product-card__details">
                <p className="product-card__category">{product.category}</p>
                <div className="product-card__title-row">
                  <h2>{product.name}</h2>
                  <span className="product-card__price">${Number(product.price).toFixed(2)}</span>
                </div>

                {(() => {
                  const productId = String(product._id);
                  const cartItem = cart.find((item) => item.productId === productId);
                  const quantity = cartItem?.quantity ?? 0;
                  const atStockLimit = quantity >= Number(product.stock ?? 0);

                  return (
                    <div className="product-card__actions">
                      {quantity === 0 ? (
                        <button
                          type="button"
                          className="product-card__button product-card__button--primary"
                          disabled={Number(product.stock ?? 0) === 0}
                          onClick={() => addToCart(product)}
                        >
                          {Number(product.stock ?? 0) === 0 ? 'Out of stock' : 'Add to cart'}
                        </button>
                      ) : (
                        <div className="product-card__quantity" aria-label={`${quantity} in cart`}>
                          <button
                            type="button"
                            className="product-card__quantity-button"
                            aria-label={`Remove one ${product.name} from cart`}
                            onClick={() => decrementCartQuantity(product)}
                          >
                            −
                          </button>
                          <span className="product-card__quantity-value" aria-live="polite">{quantity}</span>
                          <button
                            type="button"
                            className="product-card__quantity-button"
                            aria-label={`Add one ${product.name} to cart`}
                            disabled={atStockLimit}
                            onClick={() => addToCart(product)}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}