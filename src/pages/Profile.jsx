import { useState } from 'react';
import { Link } from 'react-router-dom';
import useShop from '../context/useShop';

const defaultAddressForm = {
  label: 'Home',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

export default function Profile() {
  const { user, isLoggedIn, logout, addAddress, deleteAddress } = useShop();
  const [addressForm, setAddressForm] = useState(defaultAddressForm);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setAddressError('');
    setIsSavingAddress(true);

    try {
      const payload = {
        ...addressForm,
        label: addressForm.label.trim() || 'Home',
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim(),
        isDefault: user?.addresses?.length ? addressForm.isDefault : true,
      };

      await addAddress(payload);
      setAddressForm(defaultAddressForm);
    } catch (error) {
      setAddressError(error.message || 'Unable to save address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId);
    } catch (error) {
      setAddressError(error.message || 'Unable to delete the address.');
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="veloce-profile-empty">
        <div className="veloce-profile-empty__card">
          <p className="featured-products__eyebrow">ACCOUNT</p>
          <h1>Your profile</h1>
          <p>Please sign up to view your account details.</p>
          <Link to="/" className="veloce-auth-submit veloce-auth-submit--inline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="veloce-profile-page">
      <div className="veloce-profile-shell">
        <div className="veloce-profile-header">
          <div>
            <p className="featured-products__eyebrow">ACCOUNT</p>
            <h1>{user.name}</h1>
          </div>
          <button type="button" className="veloce-profile-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="veloce-profile-grid">
          <div className="veloce-profile-card">
            <h2>Account details</h2>
            <div className="veloce-profile-field">
              <label>Full name</label>
              <input value={user.name || ''} readOnly />
            </div>
            <div className="veloce-profile-field">
              <label>Email</label>
              <input value={user.email || ''} readOnly />
            </div>
          </div>

          <div className="veloce-profile-card">
            <h2>Saved addresses</h2>
            {user.addresses?.length ? (
              user.addresses.map((address, index) => (
                <div key={`${address._id || address.label || 'address'}-${index}`} className="veloce-address-item">
                  <div className="veloce-address-header">
                    <strong>{address.label || 'Address'}{address.isDefault ? ' • Default' : ''}</strong>
                    <button
                      type="button"
                      className="veloce-address-delete"
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      Remove
                    </button>
                  </div>
                  <p>{address.fullName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              ))
            ) : (
              <p className="veloce-profile-empty-text">No addresses saved yet.</p>
            )}

            <form className="veloce-address-form" onSubmit={handleAddressSubmit}>
              <h3>Add a new address</h3>
              <div className="veloce-profile-field">
                <label htmlFor="address-label">Label</label>
                <input id="address-label" name="label" value={addressForm.label} onChange={handleAddressChange} />
              </div>
              <div className="veloce-profile-field">
                <label htmlFor="address-fullName">Full name</label>
                <input id="address-fullName" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} required />
              </div>
              <div className="veloce-profile-field">
                <label htmlFor="address-phone">Phone</label>
                <input id="address-phone" name="phone" value={addressForm.phone} onChange={handleAddressChange} required />
              </div>
              <div className="veloce-profile-field">
                <label htmlFor="address-addressLine1">Address line 1</label>
                <input id="address-addressLine1" name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressChange} required />
              </div>
              <div className="veloce-profile-field">
                <label htmlFor="address-addressLine2">Address line 2</label>
                <input id="address-addressLine2" name="addressLine2" value={addressForm.addressLine2} onChange={handleAddressChange} />
              </div>
              <div className="veloce-profile-field-row">
                <div className="veloce-profile-field">
                  <label htmlFor="address-city">City</label>
                  <input id="address-city" name="city" value={addressForm.city} onChange={handleAddressChange} required />
                </div>
                <div className="veloce-profile-field">
                  <label htmlFor="address-state">State</label>
                  <input id="address-state" name="state" value={addressForm.state} onChange={handleAddressChange} required />
                </div>
              </div>
              <div className="veloce-profile-field-row">
                <div className="veloce-profile-field">
                  <label htmlFor="address-postalCode">Postal code</label>
                  <input id="address-postalCode" name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} required />
                </div>
                <div className="veloce-profile-field">
                  <label htmlFor="address-country">Country</label>
                  <input id="address-country" name="country" value={addressForm.country} onChange={handleAddressChange} required />
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
              {addressError && <p className="veloce-address-error">{addressError}</p>}
              <button type="submit" className="veloce-auth-submit" disabled={isSavingAddress}>
                {isSavingAddress ? 'Saving...' : 'Save address'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
