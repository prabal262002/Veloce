import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useShop from '../context/useShop';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, cart, wishlist, addToCart, toggleWishlist } = useShop();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [id]);

  useEffect(() => {
    if (!addedProductId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAddedProductId(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [addedProductId]);

  const product = products.find((item) => String(item._id) === String(id));

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-details__empty">
          <p>Product not found.</p>
          <button type="button" className="product-card__button product-card__button--primary" onClick={() => navigate('/')}>
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [FALLBACK_IMAGE];
  const activeImage = images[selectedImageIndex] || images[0];

  const productId = String(product._id);
  const inCart = cart.some((item) => String(item.productId) === productId);
  const inWishlist = wishlist.includes(productId);
  const stock = Number(product.stock ?? 0);

  const handleAddToCart = () => {
    addToCart(product);
    setAddedProductId(productId);
  };

  const handlePrimaryAction = () => {
    if (inCart) {
      navigate('/checkout');
      return;
    }

    handleAddToCart();
  };

  return (
    <div className="product-details-page">
      <div className="product-details__topbar">
        <button type="button" className="product-details__back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link className="product-details__link" to="/">
          Continue shopping
        </Link>
      </div>

      <section className="product-details" aria-label={`${product.name} details`}>
        <div className="product-details__media">
          <div className="product-details__gallery">
            <div className="product-details__thumbs" aria-label="Product image gallery">
              {images.map((image, index) => (
                <button
                  key={`${productId}-${image}-${index}`}
                  type="button"
                  className={`product-details__thumb${selectedImageIndex === index ? ' is-active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View image ${index + 1} of ${product.name}`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} loading="lazy" />
                </button>
              ))}
            </div>

            <div className="product-details__main-image-wrap">
              <img className="product-details__image" src={activeImage} alt={product.name} />
            </div>
          </div>
        </div>

        <div className="product-details__content">
          <div className="product-details__title-wrap">
            <p className="product-details__eyebrow">{product.category}</p>
            <div className="product-details__title-row">
              <h1>{product.name}</h1>
              <button
                type="button"
                className={`product-details__wishlist${inWishlist ? ' is-active' : ''}`}
                onClick={() => toggleWishlist(product._id)}
              >
                {inWishlist ? '♥ Saved' : '♡ Save item'}
              </button>
            </div>
          </div>

          <div className="product-details__meta">
            <span className="product-details__price">${Number(product.price).toFixed(2)}</span>
            <span className={`product-details__stock${stock === 0 ? ' is-out' : ''}`}>
              {stock === 0 ? 'Out of stock' : 'In stock'}
            </span>
          </div>

          <p className="product-details__description">
            {product.description || 'Built for performance, comfort, and confidence on every ride.'}
          </p>

          <div className="product-details__purchase-row">
            <button
              type="button"
              className={`product-card__button product-card__button--primary${inCart ? ' is-in-cart' : ''}`}
              disabled={stock === 0}
              onClick={handlePrimaryAction}
            >
              {stock === 0 ? 'Out of stock' : inCart ? 'Proceed to checkout' : 'Add to cart'}
            </button>

            <button
              type="button"
              className="product-card__button product-card__button--ghost product-details__buy-button"
              onClick={handlePrimaryAction}
            >
              Buy now
            </button>
          </div>

          <div className="product-details__specs">
            <div>
              <span>Material</span>
              <strong>{product.material || 'Premium performance fabric'}</strong>
            </div>
            <div>
              <span>Fit</span>
              <strong>{product.fit || 'Road-ready fit'}</strong>
            </div>
            <div>
              <span>Weight</span>
              <strong>{product.weight || 'Lightweight build'}</strong>
            </div>
          </div>
        </div>
      </section>
      {addedProductId === productId && (
        <div className="cart-feedback" role="status" aria-live="polite">
          <span className="cart-feedback__check" aria-hidden="true">✓</span>
          <span>Added to cart</span>
        </div>
      )}
    </div>
  );
}
