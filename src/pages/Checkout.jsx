import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useShop from "../context/useShop";

const defaultAddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart,
    products,
    addToCart,
    decrementCartQuantity,
    authReady,
    isLoggedIn,
    cartError,
    user,
    addAddress,
    createOrder,
  } = useShop();
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const items = cart
    .map((item) => {
      const product = products.find(
        (entry) => String(entry._id) === String(item.productId),
      );
      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: Number(product.price) * Number(item.quantity),
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.lineTotal || 0),
    0,
  );
  const discount = appliedPromoCode === "VELOCE10"
    ? Math.round(subtotal * 10) / 100
    : 0;
  const total = Math.max(0, subtotal - discount);
  const addresses = user?.addresses || [];
  const selectedAddress =
    addresses.find((address) => String(address._id) === selectedAddressId) ||
    addresses.find((address) => address.isDefault) ||
    addresses[0];

  function handleAddressChange(event) {
    const { name, value, type, checked } = event.target;
    setAddressForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleAddressSubmit(event) {
    event.preventDefault();
    setAddressError("");
    setIsSavingAddress(true);

    try {
      const payload = Object.fromEntries(
        Object.entries(addressForm).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ]),
      );
      const result = await addAddress(payload);
      setSelectedAddressId(String(result.address._id));
      setAddressForm(defaultAddressForm);
      setIsAddingAddress(false);
    } catch (error) {
      setAddressError(error.message || "Unable to save address.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  function applyPromoCode() {
    const normalizedCode = promoInput.trim().toUpperCase();
    if (!normalizedCode) {
      setAppliedPromoCode("");
      setPromoMessage("");
      return;
    }

    if (normalizedCode !== "VELOCE10") {
      setAppliedPromoCode("");
      setPromoMessage("That promo code is not valid.");
      return;
    }

    setAppliedPromoCode(normalizedCode);
    setPromoInput(normalizedCode);
    setPromoMessage("VELOCE10 applied — you saved 10%.");
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setOrderError("Please add or select a delivery address first.");
      return;
    }

    setOrderError("");
    setIsPlacingOrder(true);
    try {
      const order = await createOrder({
        addressId: String(selectedAddress._id),
        promoCode: appliedPromoCode,
      });
      navigate(`/orders/${order._id}`, { replace: true });
    } catch (error) {
      setOrderError(error.message || "Unable to place your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (!authReady) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty" role="status">
            Restoring your account...
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-header">
            <div>
              <p className="featured-products__eyebrow">VELOCE / CHECKOUT</p>
              <h1>Sign in to continue</h1>
            </div>
            <Link className="product-details__link" to="/">
              Continue shopping
            </Link>
          </div>
          <div className="checkout-empty">
            <p>Your cart is saved to your account after you sign in.</p>
            <p className="checkout-auth-note">
              Use the account button in the header to sign up or log in. Guest
              cart items are temporary and clear when this page refreshes.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-header">
          <div>
            <p className="featured-products__eyebrow">VELOCE / CHECKOUT</p>
            <h1>Review your order</h1>
          </div>
          <Link className="product-details__link" to="/">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="checkout-empty">
            <p>Your cart is empty.</p>
            <Link
              className="product-card__button product-card__button--primary checkout-empty__button"
              to="/"
            >
              Browse gear
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-main">
              <section
                className="checkout-address"
                aria-labelledby="checkout-address-title"
              >
                <h2 id="checkout-address-title">Delivery address</h2>
                {addresses.length > 0 ? (
                  <>
                    <label
                      className="veloce-profile-field"
                      htmlFor="checkout-address-select"
                    >
                      <span>Choose a saved address</span>
                      <select
                        id="checkout-address-select"
                        value={
                          selectedAddress ? String(selectedAddress._id) : ""
                        }
                        onChange={(event) =>
                          setSelectedAddressId(event.target.value)
                        }
                      >
                        {addresses.map((address) => (
                          <option key={address._id} value={String(address._id)}>
                            {address.label || "Address"}
                            {address.isDefault ? " (Default)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selectedAddress && (
                      <div className="checkout-address__details">
                        <strong>{selectedAddress.fullName}</strong>
                        <p>{selectedAddress.phone}</p>
                        <p>{selectedAddress.addressLine1}</p>
                        {selectedAddress.addressLine2 && (
                          <p>{selectedAddress.addressLine2}</p>
                        )}
                        <p>
                          {selectedAddress.city}, {selectedAddress.state}{" "}
                          {selectedAddress.postalCode}
                        </p>
                        <p>{selectedAddress.country}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="checkout-address__empty">
                    Add an address to continue with delivery.
                  </p>
                )}
                <button
                  type="button"
                  className="checkout-address__toggle"
                  onClick={() => {
                    setAddressError("");
                    setIsAddingAddress((current) => !current);
                  }}
                >
                  {isAddingAddress ? "Cancel" : "Add a new address"}
                </button>
                {isAddingAddress && (
                  <form
                    className="checkout-address__form"
                    onSubmit={handleAddressSubmit}
                  >
                    <div className="veloce-profile-field">
                      <label htmlFor="checkout-address-label">Label</label>
                      <input
                        id="checkout-address-label"
                        name="label"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="veloce-profile-field">
                      <label htmlFor="checkout-address-fullName">
                        Full name
                      </label>
                      <input
                        id="checkout-address-fullName"
                        name="fullName"
                        autoComplete="name"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="veloce-profile-field">
                      <label htmlFor="checkout-address-phone">Phone</label>
                      <input
                        id="checkout-address-phone"
                        name="phone"
                        type="number"
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                        autoComplete="tel"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="veloce-profile-field">
                      <label htmlFor="checkout-address-line1">
                        Address line 1
                      </label>
                      <input
                        id="checkout-address-line1"
                        name="addressLine1"
                        autoComplete="address-line1"
                        value={addressForm.addressLine1}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="veloce-profile-field">
                      <label htmlFor="checkout-address-line2">
                        Address line 2
                      </label>
                      <input
                        id="checkout-address-line2"
                        name="addressLine2"
                        autoComplete="address-line2"
                        value={addressForm.addressLine2}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="veloce-profile-field-row">
                      <div className="veloce-profile-field">
                        <label htmlFor="checkout-address-city">City</label>
                        <input
                          id="checkout-address-city"
                          name="city"
                          autoComplete="address-level2"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      <div className="veloce-profile-field">
                        <label htmlFor="checkout-address-state">
                          State / region
                        </label>
                        <input
                          id="checkout-address-state"
                          name="state"
                          autoComplete="address-level1"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="veloce-profile-field-row">
                      <div className="veloce-profile-field">
                        <label htmlFor="checkout-address-postalCode">
                          Postal code
                        </label>
                        <input
                          id="checkout-address-postalCode"
                          type="number"
                          maxlength="6"
                          minlength="6"
                          name="postalCode"
                          inputmode="numeric"
                          autoComplete="postal-code"
                          value={addressForm.postalCode}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      <div className="veloce-profile-field">
                        <label htmlFor="checkout-address-country">
                          Country
                        </label>
                        <input
                          id="checkout-address-country"
                          name="country"
                          autoComplete="country-name"
                          value={addressForm.country}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                    </div>
                    <label className="veloce-address-default-toggle">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                      />
                      Set as default address
                    </label>
                    {addressError && (
                      <p className="veloce-address-error" role="alert">
                        {addressError}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="veloce-auth-submit"
                      disabled={isSavingAddress}
                    >
                      {isSavingAddress ? "Saving..." : "Save address"}
                    </button>
                  </form>
                )}
              </section>
              <div className="checkout-items">
                {cartError && (
                  <p className="checkout-cart-error" role="alert">
                    {cartError}
                  </p>
                )}
                {items.map((item) => (
                  <div key={item._id} className="checkout-item">
                    <img
                      src={
                        item.images?.[0] ||
                        "https://images.pexels.com/photos/20522567/pexels-photo-20522567.jpeg"
                      }
                      alt={item.name}
                    />
                    <div className="checkout-item__details">
                      <p className="checkout-item__category">{item.category}</p>
                      <h2>{item.name}</h2>
                      <div
                        className="checkout-quantity"
                        aria-label={`Quantity for ${item.name}`}
                      >
                        <button
                          type="button"
                          className="checkout-quantity__button"
                          aria-label={
                            item.quantity === 1
                              ? `Remove ${item.name} from cart`
                              : `Decrease quantity of ${item.name}`
                          }
                          onClick={() => decrementCartQuantity(item)}
                        >
                          −
                        </button>
                        <span
                          className="checkout-quantity__value"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="checkout-quantity__button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={
                            Number(item.quantity) >= Number(item.stock ?? 0)
                          }
                          onClick={() => addToCart(item)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <strong>${Number(item.lineTotal).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <aside className="checkout-summary">
              <h2>Order summary</h2>
              <div className="checkout-promo">
                <label htmlFor="checkout-promo-code">Promo code</label>
                <div className="checkout-promo__control">
                  <input
                    id="checkout-promo-code"
                    type="text"
                    value={promoInput}
                    onChange={(event) => {
                      setPromoInput(event.target.value);
                      if (appliedPromoCode) {
                        setAppliedPromoCode("");
                        setPromoMessage("");
                      }
                    }}
                    placeholder="Enter code"
                    autoComplete="off"
                  />
                  <button type="button" onClick={applyPromoCode}>
                    {appliedPromoCode ? "Applied" : "Apply"}
                  </button>
                </div>
                <p className={appliedPromoCode ? "is-success" : ""} role="status">
                  {promoMessage || "Use VELOCE10 for 10% off your items."}
                </p>
              </div>
              <div className="checkout-summary__row">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              {discount > 0 && (
                <div className="checkout-summary__row checkout-summary__row--discount">
                  <span>Discount ({appliedPromoCode})</span>
                  <strong>−${discount.toFixed(2)}</strong>
                </div>
              )}
              <div className="checkout-summary__row">
                <span>Shipping</span>
                <strong>Free</strong>
              </div>
              <div className="checkout-summary__row checkout-summary__row--total">
                <span>Total</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <p className="checkout-payment-note">Payment method: Cash on delivery</p>
              {orderError && (
                <p className="checkout-cart-error" role="alert">{orderError}</p>
              )}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || Boolean(cartError)}
                className="product-card__button product-card__button--primary checkout-summary__button"
              >
                {isPlacingOrder ? "Placing order..." : "Place order"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
