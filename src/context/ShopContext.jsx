import { useEffect, useState } from 'react';
import ShopContext from './shopContext';

const PRODUCTS_URL = 'https://veloce-be-nine.vercel.app/products';

function readStoredValue(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getProductId(product) {
  return String(product?._id ?? product?.id ?? product);
}

export default function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => readStoredValue('veloce-cart', []));
  const [wishlist, setWishlist] = useState(() => readStoredValue('veloce-wishlist', []));

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

  useEffect(() => {
    window.localStorage.setItem('veloce-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem('veloce-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  function changeCartQuantity(product, amount) {
    const productId = getProductId(product);
    const stock = Number(product?.stock ?? 0);
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === productId);
      const nextQuantity = (existingItem?.quantity ?? 0) + amount;

      if (nextQuantity <= 0) {
        return currentCart.filter((item) => item.productId !== productId);
      }

      if (nextQuantity > stock) {
        return currentCart;
      }

      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId ? { ...item, quantity: nextQuantity } : item,
        );
      }

      return [...currentCart, { productId, quantity: nextQuantity }];
    });
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
    wishlist,
    addToCart,
    decrementCartQuantity,
    toggleWishlist,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}