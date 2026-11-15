import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RangeSliderModule from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import useShop from '../context/useShop';
import { formatProductCategory } from '../utils/productCategories';

const RangeSlider = RangeSliderModule.default;

export default function ProductListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, cart, wishlist, addToCart, toggleWishlist } = useShop();
  const selectedCategories = searchParams.getAll('category');
  const searchQuery = searchParams.get('q') || '';
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceValue, setPriceValue] = useState(null);
  const [sortOrder, setSortOrder] = useState('featured');
  const [addedProductId, setAddedProductId] = useState(null);
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const maximumProductPrice = Math.max(1, ...products.map((product) => Number(product.price) || 0));
  const activePriceRange = priceValue ?? [0, maximumProductPrice];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!addedProductId) return undefined;
    const timeoutId = window.setTimeout(() => setAddedProductId(null), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [addedProductId]);

  const filteredProducts = products.filter((product) => {
    const price = Number(product.price ?? 0);
    const searchableText = [product.name, product.brand, product.description, product.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesAvailability = !inStockOnly || Number(product.stock ?? 0) > 0;
    const matchesPrice = price >= activePriceRange[0] && price <= activePriceRange[1];
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    return matchesCategory && matchesAvailability && matchesPrice && matchesQuery;
  });

  if (sortOrder === 'price-asc') {
    filteredProducts.sort((first, second) => Number(first.price ?? 0) - Number(second.price ?? 0));
  } else if (sortOrder === 'price-desc') {
    filteredProducts.sort((first, second) => Number(second.price ?? 0) - Number(first.price ?? 0));
  } else if (sortOrder === 'name-asc') {
    filteredProducts.sort((first, second) => first.name.localeCompare(second.name));
  }

  function updateSelectedCategories(nextCategories) {
    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current);
      nextParams.delete('category');
      nextCategories.forEach((category) => nextParams.append('category', category));
      return nextParams;
    }, { replace: true });
  }

  function toggleCategory(category) {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];
    updateSelectedCategories(nextCategories);
  }

  function clearFilters() {
    updateSelectedCategories([]);
    setInStockOnly(false);
    setPriceValue(null);
    setSortOrder('featured');
  }

  function handlePrimaryAction(product) {
    const productId = String(product._id);
    const inCart = cart.some((item) => String(item.productId) === productId);
    if (inCart) {
      navigate('/cart');
      return;
    }
    addToCart(product);
    setAddedProductId(productId);
  }

  if (loading) {
    return <div className="home-page"><section className="featured-products"><p className="featured-products__eyebrow">Loading products...</p></section></div>;
  }

  if (error) {
    return <div className="home-page"><section className="featured-products"><p className="featured-products__eyebrow">Unable to load products.</p></section></div>;
  }

  return (
    <div className="home-page">
      <section className="featured-products" aria-labelledby="listing-title">
        <div className="product-listing__header">
          <div>
            <p className="featured-products__eyebrow">VELOCE / CATALOG</p>
            <h1 id="listing-title">{normalizedQuery ? `Results for “${searchQuery}”` : 'Shop all products'}</h1>
          </div>
          <Link className="product-details__link" to="/">Back to home</Link>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-filters" aria-label="Product filters">
            <div className="catalog-filters__heading">
              <h2>Filters</h2>
              <button type="button" onClick={clearFilters}>Clear</button>
            </div>
            <fieldset className="catalog-filters__group">
              <legend>Category</legend>
              {categories.map((category) => (
                <label className="catalog-filter-option" key={category}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span>{formatProductCategory(category)}</span>
                </label>
              ))}
            </fieldset>
            <fieldset className="catalog-filters__group">
              <legend>Availability</legend>
              <label className="catalog-filter-option">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) => setInStockOnly(event.target.checked)}
                />
                <span>In stock only</span>
              </label>
            </fieldset>
            <fieldset className="catalog-filters__group">
              <legend>Price range</legend>
              <div className="catalog-price-range__values" aria-live="polite">
                <span>${activePriceRange[0].toFixed(2)}</span>
                <span aria-hidden="true">to</span>
                <span>${activePriceRange[1].toFixed(2)}</span>
              </div>
              <RangeSlider
                className="catalog-filters__price-slider"
                min={0}
                max={maximumProductPrice}
                step="any"
                value={activePriceRange}
                onInput={setPriceValue}
                ariaLabel={['Minimum price', 'Maximum price']}
              />
            </fieldset>
          </aside>

          <div className="catalog-results">
            <div className="catalog-results__bar">
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}</span>
              <label className="catalog-sort">
                <span>Sort</span>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort products">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </label>
            </div>

            {filteredProducts.length ? (
              <div className="product-grid">
                {filteredProducts.map((product, index) => {
                  const productId = String(product._id);
                  const inCart = cart.some((item) => String(item.productId) === productId);
                  const isWishlisted = wishlist.includes(productId);
                  const rating = Number(product.ratingAverage || 0);

                  return (
                    <article className="product-card" key={productId}>
                      <div className="product-card__image-wrap">
                        <Link to={`/product/${productId}`} aria-label={`View ${product.name}`}>
                          <img
                            className="product-card__image"
                            src={product.images?.[0] || 'https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg'}
                            alt={product.name}
                            loading="lazy"
                          />
                        </Link>
                        <span className="product-card__number">{String(index + 1).padStart(2, '0')}</span>
                        <button
                          type="button"
                          className={`product-card__wishlist${isWishlisted ? ' is-active' : ''}`}
                          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
                          aria-pressed={isWishlisted}
                          onClick={() => toggleWishlist(productId)}
                        >
                          {isWishlisted ? '♥' : '♡'}
                        </button>
                      </div>
                      <div className="product-card__details">
                        <p className="product-card__category">{formatProductCategory(product.category)}</p>
                        <div className="product-card__title-row">
                          <h2><Link to={`/product/${productId}`}>{product.name}</Link></h2>
                          <span className="product-card__price">${Number(product.price).toFixed(2)}</span>
                        </div>
                        {Number(product.reviewCount) > 0 && (
                          <p
                            className="product-card__rating"
                            aria-label={`${rating.toFixed(1)} out of 5 stars from ${product.reviewCount} reviews`}
                          >
                            <span aria-hidden="true">
                              {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
                            </span>
                            <strong>{rating.toFixed(1)}</strong>
                            <span>({product.reviewCount})</span>
                          </p>
                        )}
                        <div className="product-card__actions">
                          <button
                            type="button"
                            className={`product-card__button product-card__button--primary${inCart ? ' is-in-cart' : ''}`}
                            disabled={Number(product.stock ?? 0) === 0}
                            onClick={() => handlePrimaryAction(product)}
                          >
                            {Number(product.stock ?? 0) === 0 ? 'Out of stock' : inCart ? 'View cart' : 'Add to cart'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="catalog-empty">
                <h2>No products match these filters</h2>
                <p>Try a different search or clear the selected filters.</p>
                <button type="button" className="product-card__button product-card__button--ghost" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
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
