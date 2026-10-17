import { useEffect, useRef, useState } from 'react';
import ShopContext from './shopContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://veloce-be-nine.vercel.app';
const PRODUCTS_URL = `${API_URL}/products`;

function getProductId(product) {
  return String(product?._id ?? product?.id ?? product);
}

export default function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [cartError, setCartError] = useState('');
  const cartRef = useRef(cart);
  const cartWriteQueue = useRef(Promise.resolve());

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(PRODUCTS_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Product request failed (${response.status})`);
        }
        const result = await response.json();
        setProducts(Array.isArray(result.products) ? result.products : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Unable to load products.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  async function refreshUser() {
    try {
      const response = await fetch(`${API_URL}/me`, { credentials: 'include' });
      if (!response.ok) {
        setUser(null);
        cartRef.current = [];
        setCart([]);
        return null;
      }

      const result = await response.json();
      const nextUser = result.user || null;
      setUser(nextUser);
      const savedCart = nextUser?.cart || [];
      cartRef.current = savedCart;
      setCart(savedCart);
      return nextUser;
    } catch {
      setCartError('Unable to restore your saved cart.');
      return null;
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const response = await fetch(`${API_URL}/me`, { credentials: 'include' });
        if (!response.ok) return;

        const result = await response.json();
        if (active) {
          setUser(result.user);
          const savedCart = result.user.cart || [];
          cartRef.current = savedCart;
          setCart(savedCart);
        }
      } catch {
        if (active) setCartError('Unable to restore your saved cart.');
      } finally {
        if (active) setAuthReady(true);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  async function sendCart(nextCart) {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: nextCart }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to save your cart.');
    }

    return result.cart;
  }

  function persistCart(nextCart) {
    cartWriteQueue.current = cartWriteQueue.current
      .catch(() => {})
      .then(() => sendCart(nextCart))
      .then(() => setCartError(''))
      .catch((saveError) => setCartError(saveError.message || 'Unable to save your cart.'));
  }

  function mergeCarts(savedCart, guestCart) {
    const merged = new Map();

    for (const item of savedCart) {
      merged.set(String(item.productId), Number(item.quantity));
    }

    for (const item of guestCart) {
      const productId = String(item.productId);
      const existingQuantity = merged.get(productId) || 0;
      const product = products.find((entry) => String(entry._id) === productId);
      const stockLimit = Number(product?.stock ?? Infinity);
      merged.set(productId, Math.min(existingQuantity + Number(item.quantity), stockLimit));
    }

    return [...merged].filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  async function authenticateWith(endpoint, formData) {
    const guestCart = cartRef.current;
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `${endpoint} failed.`);
    }

    const accountCart = result.user.cart || [];
    const mergedCart = mergeCarts(accountCart, guestCart);
    setUser(result.user);
    cartRef.current = mergedCart;
    setCart(mergedCart);
    setAuthReady(true);

    try {
      const persistedCart = await sendCart(mergedCart);
      cartRef.current = persistedCart;
      setCart(persistedCart);
      setCartError('');
    } catch (saveError) {
      setCartError(saveError.message || 'Unable to save your cart.');
    }

    return result;
  }

  async function signup(formData) {
    return authenticateWith('signup', formData);
  }

  async function login(formData) {
    return authenticateWith('login', formData);
  }

  function logout() {
    fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
    cartRef.current = [];
    setCart([]);
    setCartError('');
  }

  function changeCartQuantity(product, amount) {
    const productId = getProductId(product);
    const stock = Number(product?.stock ?? 0);
    const currentCart = cartRef.current;
    const existingItem = currentCart.find((item) => String(item.productId) === productId);
    const nextQuantity = (existingItem?.quantity ?? 0) + amount;
    let nextCart;

    if (nextQuantity <= 0) {
      nextCart = currentCart.filter((item) => String(item.productId) !== productId);
    } else if (nextQuantity > stock) {
      return;
    } else if (existingItem) {
      nextCart = currentCart.map((item) =>
        String(item.productId) === productId ? { ...item, quantity: nextQuantity } : item,
      );
    } else {
      nextCart = [...currentCart, { productId, quantity: nextQuantity }];
    }

    cartRef.current = nextCart;
    setCart(nextCart);
    if (user) persistCart(nextCart);
  }

  function addToCart(product) {
    changeCartQuantity(product, 1);
  }

  function decrementCartQuantity(product) {
    changeCartQuantity(product, -1);
  }

  function toggleWishlist(product) {
    const productId = getProductId(product);
    setWishlist((currentWishlist) =>
      currentWishlist.includes(productId)
        ? currentWishlist.filter((id) => id !== productId)
        : [...currentWishlist, productId],
    );
  }

  const value = {
    products,
    loading,
    error,
    cart,
    cartError,
    wishlist,
    user,
    authReady,
    isLoggedIn: Boolean(user),
    signup,
    login,
    logout,
    refreshUser,
    addToCart,
    decrementCartQuantity,
    toggleWishlist,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}