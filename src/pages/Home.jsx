import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useShop from '../context/useShop';
import RangeSliderModule from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const RangeSlider = RangeSliderModule.default;

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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceValue, setPriceValue] = useState(null);
  const [sortOrder, setSortOrder] = useState('featured');
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const maximumProductPrice = Math.max(1, ...products.map((product) => Number(product.price) || 0));
  const activePriceRange = priceValue ?? [0, maximumProductPrice];
  const filteredProducts = products.filter((product) => {
    const price = Number(product.price ?? 0);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesAvailability = !inStockOnly || Number(product.stock ?? 0) > 0;
    const matchesPrice = price >= activePriceRange[0] && price <= activePriceRange[1];
    return matchesCategory && matchesAvailability && matchesPrice;
  });
  if (sortOrder === 'price-asc') {
    filteredProducts.sort((first, second) => Number(first.price ?? 0) - Number(second.price ?? 0));
  } else if (sortOrder === 'price-desc') {
    filteredProducts.sort((first, second) => Number(second.price ?? 0) - Number(first.price ?? 0));
  } else if (sortOrder === 'name-asc') {
    filteredProducts.sort((first, second) => first.name.localeCompare(second.name));
  }

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

  const toggleCategory = (category) => {
    setSelectedCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setInStockOnly(false);
    setPriceValue(null);
    setSortOrder('featured');
  };

  if (loading) {
    return <div className="home-page"><section className="featured-products"><p className="featured-products__eyebrow">Loading products...</p></section></div>;
  }

  if (error) {
    return <div className="home-page"><section className="featured-products"><p className="featured-products__eyebrow">Unable to load products: {error}</p></section></div>;
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
          <span className="featured-products__count">GEAR / {String(filteredProducts.length).padStart(2, '0')}</span>
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
                  <span>{category}</span>
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
          {filteredProducts.map((product, index) => (
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
            ) : (
              <div className="catalog-empty">
                <h2>No gear matches these filters</h2>
                <p>Try another category or clear your filters.</p>
                <button type="button" className="product-card__button product-card__button--ghost" onClick={clearFilters}>Clear filters</button>
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