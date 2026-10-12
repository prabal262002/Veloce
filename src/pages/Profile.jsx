import { Link } from 'react-router-dom';
import useShop from '../context/useShop';

export default function Profile() {
  const { user, isLoggedIn, logout } = useShop();

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
                <div key={`${address.label || 'address'}-${index}`} className="veloce-address-item">
                  <strong>{address.label || 'Address'}{address.isDefault ? ' • Default' : ''}</strong>
                  <p>{address.fullName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                </div>
              ))
            ) : (
              <p className="veloce-profile-empty-text">No addresses saved yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
