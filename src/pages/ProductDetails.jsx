import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useShop from '../context/useShop';
import { formatProductCategory } from '../utils/productCategories';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg';
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? '/api'
  : 'https://veloce-be-nine.vercel.app');
const REVIEWS_PER_PAGE = 10;

async function readReviewResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Reviews are temporarily unavailable. Please try again later.');
  }
  return response.json();
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, cart, wishlist, addToCart, toggleWishlist, isLoggedIn } = useShop();
  const [selectedImage, setSelectedImage] = useState({ productId: id, index: 0 });
  const [addedProductId, setAddedProductId] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [myReviewData, setMyReviewData] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState('');
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const response = await fetch(
          `${API_URL}/products/${id}/reviews?page=1&limit=${REVIEWS_PER_PAGE}`,
        );
        const result = await readReviewResponse(response);
        if (!response.ok) {
          throw new Error(result.error || 'Unable to load reviews.');
        }

        if (active) {
          setReviewData({ productId: id, ...result });
          setReviewError(null);
        }
      } catch (error) {
        if (active) {
          setReviewError({ productId: id, message: error.message || 'Unable to load reviews.' });
        }
      }
    }

    async function loadMyReview() {
      if (!isLoggedIn) {
        setMyReviewData({ productId: id, review: null });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/products/${id}/reviews/me`, {
          credentials: 'include',
        });
        const result = await readReviewResponse(response);
        if (!response.ok) {
          throw new Error(result.error || 'Unable to load your review.');
        }

        if (active) {
          setMyReviewData({ productId: id, review: result.review });
          if (result.review) {
            setReviewForm({ rating: result.review.rating, comment: result.review.comment || '' });
          }
        }
      } catch (error) {
        if (active) {
          setMyReviewData({ productId: id, error: error.message || 'Unable to load your review.' });
        }
      }
    }

    loadReviews();
    loadMyReview();
    return () => {
      active = false;
    };
  }, [id, isLoggedIn]);

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
  const selectedImageIndex = selectedImage.productId === id ? selectedImage.index : 0;
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

  async function handleLoadMoreReviews() {
    const nextPage = reviewData.pagination.page + 1;
    setIsLoadingMoreReviews(true);
    setReviewError(null);

    try {
      const response = await fetch(
        `${API_URL}/products/${id}/reviews?page=${nextPage}&limit=${REVIEWS_PER_PAGE}`,
      );
      const result = await readReviewResponse(response);
      if (!response.ok) {
        throw new Error(result.error || 'Unable to load more reviews.');
      }

      setReviewData((current) => current?.productId === id
        ? {
            ...result,
            reviews: [...current.reviews, ...result.reviews],
          }
        : current);
    } catch (error) {
      setReviewError({ productId: id, message: error.message || 'Unable to load more reviews.' });
    } finally {
      setIsLoadingMoreReviews(false);
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewSubmitError('');
    setIsSubmittingReview(true);

    try {
      const existingReview = myReviewData?.productId === id ? myReviewData.review : null;
      const response = await fetch(
        `${API_URL}/products/${id}/reviews${existingReview ? '/me' : ''}`,
        {
          method: existingReview ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: reviewForm.rating,
            comment: reviewForm.comment.trim(),
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to save your review.');
      }

      setMyReviewData({ productId: id, review: result.review });
      const reviewsResponse = await fetch(
        `${API_URL}/products/${id}/reviews?page=1&limit=${REVIEWS_PER_PAGE}`,
      );
      const reviewsResult = await readReviewResponse(reviewsResponse);
      if (!reviewsResponse.ok) {
        throw new Error(reviewsResult.error || 'Review saved, but the review list could not be refreshed.');
      }
      setReviewData({ productId: id, ...reviewsResult });
    } catch (error) {
      setReviewSubmitError(error.message || 'Unable to save your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  const currentReviewData = reviewData?.productId === id ? reviewData : null;
  const currentReviewError = reviewError?.productId === id ? reviewError.message : '';
  const currentMyReviewData = myReviewData?.productId === id ? myReviewData : null;

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
                  onClick={() => setSelectedImage({ productId: id, index })}
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
            <p className="product-details__eyebrow">{formatProductCategory(product.category)}</p>
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
          <a className="product-details__rating-link" href="#product-reviews">
            {currentReviewData?.summary?.reviewCount ? (
              <>
                <span aria-label={`${currentReviewData.summary.averageRating.toFixed(1)} out of 5 stars`}>
                  {'★'.repeat(Math.round(currentReviewData.summary.averageRating))}
                  {'☆'.repeat(5 - Math.round(currentReviewData.summary.averageRating))}
                </span>
                <strong>{currentReviewData.summary.averageRating.toFixed(1)}</strong>
                <span>{currentReviewData.summary.reviewCount} reviews</span>
              </>
            ) : (
              <span>{currentReviewData ? 'Be the first to review' : 'Loading rating...'}</span>
            )}
          </a>

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
      <section className="product-reviews" id="product-reviews" aria-labelledby="product-reviews-title">
        <div className="product-reviews__header">
          <div>
            <p className="product-details__eyebrow">RIDER FEEDBACK</p>
            <h2 id="product-reviews-title">Ratings &amp; reviews</h2>
          </div>
          {currentReviewData && (
            <div className="product-reviews__summary">
              <strong>{currentReviewData.summary.averageRating
                ? currentReviewData.summary.averageRating.toFixed(1)
                : '—'}</strong>
              <span aria-hidden="true">
                {'★'.repeat(Math.round(currentReviewData.summary.averageRating))}
                {'☆'.repeat(5 - Math.round(currentReviewData.summary.averageRating))}
              </span>
              <small>{currentReviewData.summary.reviewCount} reviews</small>
            </div>
          )}
        </div>

        <div className="product-reviews__layout">
          <div className="product-reviews__list">
            {currentReviewError && <p className="product-reviews__error" role="alert">{currentReviewError}</p>}
            {!currentReviewData && !currentReviewError && <p>Loading reviews...</p>}
            {currentReviewData?.reviews.length === 0 && (
              <p className="product-reviews__empty">No reviews yet. Share your experience with this product.</p>
            )}
            {currentReviewData?.reviews.map((review) => (
              <article className="product-review" key={review._id}>
                <div className="product-review__header">
                  <strong>{review.user?.name || 'Rider'}</strong>
                  <time dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="product-review__stars" aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </p>
                {review.comment && <p className="product-review__comment">{review.comment}</p>}
              </article>
            ))}
            {currentReviewData?.pagination.page < currentReviewData?.pagination.pages && (
              <button
                type="button"
                className="product-details__back product-reviews__more"
                onClick={handleLoadMoreReviews}
                disabled={isLoadingMoreReviews}
              >
                {isLoadingMoreReviews ? 'Loading...' : 'Load more reviews'}
              </button>
            )}
          </div>

          <div className="product-reviews__form-wrap">
            <h3>{currentMyReviewData?.review ? 'Update your review' : 'Write a review'}</h3>
            {!isLoggedIn ? (
              <p className="product-reviews__signin">Sign in to leave a rating and review.</p>
            ) : currentMyReviewData?.error ? (
              <p className="product-reviews__error" role="alert">{currentMyReviewData.error}</p>
            ) : (
              <form className="product-review-form" onSubmit={handleReviewSubmit}>
                <fieldset className="product-review-form__rating">
                  <legend>Your rating</legend>
                  <div>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        aria-pressed={Number(reviewForm.rating) === rating}
                        aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                        className={rating <= Number(reviewForm.rating) ? 'is-selected' : ''}
                        onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="product-review-form__comment" htmlFor="product-review-comment">
                  Your review <span>(optional)</span>
                  <textarea
                    id="product-review-comment"
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))}
                    maxLength={2000}
                    rows={5}
                    placeholder="What did you think of this product?"
                  />
                </label>
                {reviewSubmitError && <p className="product-reviews__error" role="alert">{reviewSubmitError}</p>}
                <button
                  type="submit"
                  className="product-card__button product-card__button--primary"
                  disabled={isSubmittingReview || !currentMyReviewData}
                >
                  {isSubmittingReview
                    ? 'Saving...'
                    : currentMyReviewData?.review ? 'Update review' : 'Submit review'}
                </button>
              </form>
            )}
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
