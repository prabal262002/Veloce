import { useEffect, useRef, useState } from 'react';
import useShop from '../context/useShop';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
let googleIdentityScriptPromise;

const emptyForm = {
  name: '',
  email: '',
  password: '',
};

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-identity]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve, { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch((error) => {
      googleIdentityScriptPromise = null;
      throw error;
    });
  }

  return googleIdentityScriptPromise;
}

function GoogleSignInButton({ onCredential, onError }) {
  const buttonRef = useRef(null);
  const callbacksRef = useRef({ onCredential, onError });

  useEffect(() => {
    callbacksRef.current = { onCredential, onError };
  }, [onCredential, onError]);

  useEffect(() => {
    let active = true;
    loadGoogleIdentityScript()
      .then(() => {
        if (!active) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (!response.credential) {
              callbacksRef.current.onError('Google did not return a sign-in credential.');
              return;
            }
            callbacksRef.current.onCredential(response.credential);
          },
        });
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            text: 'continue_with',
            width: 360,
          });
        }
      })
      .catch(() => {
        if (active) {
          callbacksRef.current.onError('Unable to load Google sign-in. Please try again.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return <div className="veloce-google-signin" ref={buttonRef} />;
}

function ProductSearch({ initialQuery }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(initialQuery);

  function handleSubmit(event) {
    event.preventDefault();
    const query = searchInput.trim();
    navigate({
      pathname: '/',
      search: query ? `?q=${encodeURIComponent(query)}` : '',
    });
  }

  return (
    <form className="d-flex flex-grow-1 veloce-search" role="search" onSubmit={handleSubmit}>
      <input
        className="form-control"
        type="search"
        placeholder="SEARCH PERFORMANCE PARTS & GEAR"
        aria-label="Search performance parts and gear"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <button className="veloce-search__button" type="submit">Search</button>
    </form>
  );
}

export default function Header() {
  const { wishlist, cart, isLoggedIn, signup, login, googleSignIn, logout } = useShop();
  const location = useLocation();
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

  async function handleGoogleCredential(credential) {
    setAuthError('');
    try {
      await googleSignIn(credential);
      setAuthForm(emptyForm);
      setIsAuthOpen(false);
      setIsProfileOpen(false);
    } catch (error) {
      setAuthError(error.message || 'Google sign-in failed.');
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

            <ProductSearch
              key={location.search}
              initialQuery={new URLSearchParams(location.search).get('q') || ''}
            />

            <div className="d-flex align-items-center gap-4 text-nowrap veloce-actions">
              <Link
                className="veloce-icon-link"
                to="/wishlist"
                aria-label={`Wishlist, ${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'}`}
                title="Wishlist"
              >
                <svg className="veloce-icon-link__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                </svg>
                <sup className="veloce-icon-link__count">{wishlist.length}</sup>
              </Link>
              <Link
                className="veloce-icon-link"
                to="/checkout"
                aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
                title="Cart"
              >
                <svg className="veloce-icon-link__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6" />
                  <circle cx="10" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
                <sup className="veloce-icon-link__count">{cartCount}</sup>
              </Link>

              {isLoggedIn ? (
                <div className="veloce-profile-wrap">
                  <button
                    type="button"
                    className="veloce-profile-button"
                    aria-label="Open profile menu"
                    onClick={() => setIsProfileOpen((current) => !current)}
                  >
                    <img src="/user-avatar.svg" alt="" aria-hidden="true" />
                  </button>

                  {isProfileOpen && (
                    <div className="veloce-profile-menu">
                      <Link className="veloce-profile-menu__item" to="/orders" onClick={() => setIsProfileOpen(false)}>
                        My Orders
                      </Link>
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
              {GOOGLE_CLIENT_ID ? (
                <>
                  <GoogleSignInButton
                    onCredential={handleGoogleCredential}
                    onError={setAuthError}
                  />
                  <div className="veloce-auth-divider"><span>or use email</span></div>
                </>
              ) : (
                <p className="veloce-google-signin-note">
                  Google sign-in is unavailable until VITE_GOOGLE_CLIENT_ID is configured.
                </p>
              )}

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
