export default function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="container-fluid py-5 px-4">
        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="footer-brand">
              <span className="veloce-brand-mark">V</span>
              <span>VELOCE</span>
            </div>
            <p className="footer-tagline mt-3">
              PERFORMANCE PARTS. TRACK-READY GEAR. BUILT TO MOVE.
            </p>
            <p className="footer-copy">
              Engineered essentials for riders who refuse to leave performance
              on the table.
            </p>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h2 className="footer-heading">SHOP</h2>
            <a href="#parts">Performance Parts</a>
            <a href="#gear">Track Gear</a>
            <a href="#new-arrivals">New Arrivals</a>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h2 className="footer-heading">SUPPORT</h2>
            <a href="#contact">Contact Us</a>
            <a href="#shipping">Shipping & Returns</a>
            <a href="#fitment">Fitment Guide</a>
          </div>

          <div className="col-12 col-lg-3">
            <h2 className="footer-heading">STAY IN THE SLIPSTREAM</h2>
            <p className="footer-copy mb-3">New drops and race-day intel, direct to your inbox.</p>
            <form className="footer-subscribe d-flex" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="EMAIL ADDRESS" aria-label="Email address" />
              <button type="submit" aria-label="Subscribe to newsletter">JOIN</button>
            </form>
          </div>
        </div> 

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between gap-2 mt-5 pt-3">
          <span>© 2026 VELOCE MOTORSPORT SUPPLY</span>
          <span>BUILT FOR THE NEXT APEX</span>
        </div>
      </div>
    </footer>
  );
}