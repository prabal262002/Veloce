import { useState } from 'react';
import useShop from '../context/useShop';
import { Link } from 'react-router-dom';

const emptyForm = {
  name: '',
  email: '',
  password: '',
};

export default function Header() {
  const { wishlist, cart, isLoggedIn, user, signup, login, logout } = useShop();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authForm, setAuthForm] = useState(emptyForm);
  const [authError, setAuthError] = useState('');

  const cartCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setAuthForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError('');

    try {
      if (authMode === 'signup') {
        await signup({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        });
      } else {
        await login({
          email: authForm.email,
          password: authForm.password,
        });
      }

      setAuthForm(emptyForm);
      setIsAuthOpen(false);
      setIsProfileOpen(false);
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    }
  }

  function closeModal() {
    setIsAuthOpen(false);
    setIsProfileOpen(false);
    setAuthError('');
    setAuthForm(emptyForm);
  }

  return (
    <>
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
                <span aria-hidden="true">♡</span> WISHLIST <b>{wishlist.length}</b>
              </Link>
              <Link to="/checkout" aria-label={`Cart, ${cartCount} items`}>
                <span aria-hidden="true">▱</span> CART <b>{cartCount}</b>
              </Link>

              {isLoggedIn ? (
                <div className="veloce-profile-wrap">
                  <button
                    type="button"
                    className="veloce-profile-button"
                    aria-label="Open profile menu"
                    onClick={() => setIsProfileOpen((current) => !current)}
                  >
                    <span aria-hidden="true">◉</span>
                  </button>

                  {isProfileOpen && (
                    <div className="veloce-profile-menu">
                      <Link className="veloce-profile-menu__item" to="/profile" onClick={() => setIsProfileOpen(false)}>
                        My Profile
                      </Link>
                      <button
                        type="button"
                        className="veloce-profile-menu__item veloce-profile-menu__item--button"
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="veloce-auth-button"
                  onClick={() => {
                    setAuthMode('signup');
                    setIsAuthOpen(true);
                  }}
                >
                  Sign up
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {isAuthOpen && (
        <div className="veloce-auth-modal" aria-modal="true" role="dialog">
          <div className="veloce-auth-modal__panel">
            <div className="veloce-auth-modal__header">
              <div>
                <p className="featured-products__eyebrow">ACCOUNT</p>
                <h3>{authMode === 'signup' ? 'Create account' : 'Welcome back'}</h3>
              </div>
              <button type="button" className="veloce-auth-modal__close" aria-label="Close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="veloce-auth-form">
              {authMode === 'signup' && (
                <div className="veloce-form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="veloce-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="veloce-form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {authError && <div className="veloce-auth-error">{authError}</div>}

              <div className="veloce-auth-switch">
                {authMode === 'signup' ? 'Already have an account?' : 'Need an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode((currentMode) => (currentMode === 'signup' ? 'login' : 'signup'));
                    setAuthError('');
                  }}
                >
                  {authMode === 'signup' ? 'Log in' : 'Sign up'}
                </button>
              </div>

              <button type="submit" className="veloce-auth-submit">
                {authMode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
