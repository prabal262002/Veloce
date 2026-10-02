import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useShop from '../context/useShop';

export default function Home() {
  const navigate = useNavigate();
  const {
    products,
    loading,
    error,
    cart,
    wishlist,
    addToCart,
    toggleWishlist,
  } = useShop();
  const [addedProductId, setAddedProductId] = useState(null);
  const featuredProducts = products.slice(0, 3);

  useEffect(() => {
    if (!addedProductId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAddedProductId(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [addedProductId]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedProductId(String(product._id));
  };

  const handlePrimaryAction = (product) => {
    const productId = String(product._id);
    const inCart = cart.some((item) => String(item.productId) === productId);

    if (inCart) {
      navigate('/checkout');
      return;
    }

    handleAddToCart(product);
  };

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
            <article
              className="product-card"
              key={product._id || product.name}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${product.name}`}
              onClick={() => navigate(`/product/${product._id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/product/${product._id}`);
                }
              }}
            >
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
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleWishlist(product._id);
                  }}
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
                  const inCart = cart.some((item) => String(item.productId) === productId);
                  const outOfStock = Number(product.stock ?? 0) === 0;

                  return (
                    <div className="product-card__actions">
                      <button
                        type="button"
                        className={`product-card__button product-card__button--primary${inCart ? ' is-in-cart' : ''}`}
                        disabled={outOfStock}
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePrimaryAction(product);
                        }}
                      >
                        {outOfStock ? 'Out of stock' : inCart ? 'Proceed to checkout' : 'Add to cart'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </article>
          ))}
        </div>
      </section>
      {addedProductId && (
        <div className="cart-feedback" role="status" aria-live="polite">
          <span className="cart-feedback__check" aria-hidden="true">✓</span>
          <span>Added to cart</span>
        </div>
      )}
    </div>
  );
}