export default function Header() {
  return (
    <header className="site-header">
      <nav className="navbar navbar-expand veloce-navbar">
        <div className="container-fluid gap-4">
          <a className="navbar-brand veloce-brand" href="#">
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
            <a href="#wishlist">
              <span aria-hidden="true">♡</span> WISHLIST <b>00</b>
            </a>
            <a href="#cart">
              <span aria-hidden="true">▱</span> CART <b>00</b>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
