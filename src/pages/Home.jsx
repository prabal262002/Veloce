import { Link } from 'react-router-dom';
import useShop from '../context/useShop';
import { formatProductCategory } from '../utils/productCategories';

export default function Home() {
  const { products, loading, error } = useShop();
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const categoryCards = categories.map((category) => {
    const categoryProducts = products.filter((product) => product.category === category);
    return {
      category,
      image: categoryProducts[0]?.images?.[0],
      count: categoryProducts.length,
    };
  });

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
            <p className="featured-products__eyebrow">VELOCE / PERFORMANCE MOTORCYCLE SUPPLY</p>
            <h1 id="featured-title">Built for the ride ahead.</h1>
            <p className="featured-products__intro">
              Explore equipment and performance parts selected for every kind of road.
            </p>
          </div>
          <Link className="home-catalog-link" to="/products">Browse all products</Link>
        </div>

        <section className="category-showcase" aria-labelledby="category-showcase-title">
          <div className="category-showcase__heading">
            <div>
              <p className="featured-products__eyebrow">BROWSE THE RANGE</p>
              <h2 id="category-showcase-title">Find your next upgrade</h2>
            </div>
            <span>{categoryCards.length} categories</span>
          </div>
          <div className="category-showcase__grid">
            {categoryCards.map(({ category, image, count }) => (
              <Link
                key={category}
                className="category-tile"
                to={`/products?category=${encodeURIComponent(category)}`}
              >
                {image && <img src={image} alt="" loading="lazy" />}
                <span className="category-tile__name">{formatProductCategory(category)}</span>
                <span className="category-tile__count">{count} products</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}