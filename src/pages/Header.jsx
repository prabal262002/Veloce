import useShop from "../context/useShop";
import { Link } from "react-router-dom";

export default function Header() {
  const { wishlist, cart } = useShop();
  const cartCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand veloce-navbar">
        <div className="container-fluid gap-4">
          <a className="navbar-brand veloce-brand" href="/">
            <span className="veloce-brand-mark">V</span>
            <span>VELOCE</span>
            <small>RIDE FASTER</small>
          </a>

          <form className="d-flex flex-grow-1 veloce-search" role="search">
            <input
              className="form-control"
              type="search"
              placeholder="SEARCH PERFORMANCE PARTS & GEAR"
              aria-label="Search performance parts and gear"
            />
          </form>

          <div className="d-flex align-items-center gap-4 text-nowrap veloce-actions">
            <Link to="/wishlist">
              <span aria-hidden="true">♡</span> WISHLIST{" "}
              <b>{wishlist.length}</b>
            </Link>
            <Link to="/checkout" aria-label={`Cart, ${cartCount} items`}>
              <span aria-hidden="true">▱</span> CART <b>{cartCount}</b>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
