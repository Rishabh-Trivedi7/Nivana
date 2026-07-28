import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile, uploadAvatar } from '../services/authService.js';
import { getUserBookings } from '../services/bookingService.js';
import { getProperties } from '../services/propertyService.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Toast from '../components/common/Toast.jsx';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const isHost = user?.role === 'host' || user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('info');
  const [bookings, setBookings] = useState([]);
  const [hostProperties, setHostProperties] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Avatar upload
  const avatarInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Sync form when user object updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Fetch booking history
  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        setLoadingBookings(true);
        setError('');
        try {
          const res = await getUserBookings();
          const history = res.data.bookings.filter((b) =>
            ['completed', 'cancelled'].includes(b.bookingStatus)
          );
          setBookings(history);
        } catch {
          setError('Failed to load booking history');
        } finally {
          setLoadingBookings(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab]);

  // Fetch host properties
  useEffect(() => {
    if (activeTab === 'properties' && isHost) {
      const fetchProperties = async () => {
        setLoadingProperties(true);
        setError('');
        try {
          const res = await getProperties({ ownerId: user._id, limit: 50 });
          setHostProperties(res.data.properties || []);
        } catch {
          setError('Failed to load your properties');
        } finally {
          setLoadingProperties(false);
        }
      };
      fetchProperties();
    }
  }, [activeTab, isHost, user?._id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // Upload to server
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarUploading(true);
    setError('');
    try {
      await uploadAvatar(formData);
      await refreshProfile();
      setSuccess('Profile picture updated!');
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      setAvatarPreview(user?.avatar || ''); // revert preview on error
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setFormLoading(true);
    try {
      const updateData = { fullName, email, phone, bio };
      if (password) updateData.password = password;
      await updateProfile(updateData);
      await refreshProfile();
      setSuccess('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getInitials = (name) => {
    if (!name) return 'N';
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  };

  const tabs = [
    { id: 'info', label: 'Personal Details' },
    { id: 'history', label: 'Travel History' },
    ...(isHost ? [{ id: 'properties', label: 'My Properties' }] : []),
  ];

  return (
    <div className="profile-page">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">My Profile</h1>
          <p className="page-hero__subtitle">Your account details and travel history.</p>
        </div>
      </div>

      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            {/* Avatar with upload */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar" onClick={() => avatarInputRef.current?.click()} title="Click to change photo">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="profile-avatar__img" />
                ) : (
                  getInitials(user?.fullName)
                )}
                <div className="profile-avatar__overlay">
                  {avatarUploading ? (
                    <span className="profile-avatar__spinner" />
                  ) : (
                    <span className="profile-avatar__camera">📷</span>
                  )}
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="profile-avatar__input"
                onChange={handleAvatarChange}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="profile-avatar__label">
                {avatarUploading ? 'Uploading…' : 'Change photo'}
              </label>
            </div>

            <h2 className="profile-name">{user?.fullName}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role-badge">{user?.role}</span>

            {user?.phone && (
              <p className="profile-phone">📞 {user.phone}</p>
            )}

            {user?.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}

            <div className="profile-meta-info">
              <div className="profile-meta-row">
                <span className="profile-meta-label">Member Since</span>
                <span className="profile-meta-val">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>
              {isHost && (
                <div className="profile-meta-row">
                  <span className="profile-meta-label">Role</span>
                  <span className="profile-meta-val profile-meta-val--host">Host</span>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="profile-content">
            <div className="profile-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && <ErrorMessage message={error} />}
            <Toast message={success} onClose={() => setSuccess('')} />

            {/* ── Personal Details tab ── */}
            {activeTab === 'info' && (
              <div className="profile-card">
                <form onSubmit={handleUpdateInfo} className="profile-form">
                  <h3 className="profile-form__section-title">Edit Details</h3>
                  <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />

                  <div className="input-group">
                    <label className="input-group__label" htmlFor="profile-bio">
                      About / Bio
                    </label>
                    <textarea
                      id="profile-bio"
                      className="input-group__input profile-bio-textarea"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell guests a little about yourself…"
                      maxLength={500}
                    />
                    <span className="profile-bio-counter">{bio.length}/500</span>
                  </div>

                  <h3 className="profile-form__section-title" style={{ marginTop: '1.5rem' }}>
                    Change Password
                  </h3>
                  <Input
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                  />

                  <Button type="submit" loading={formLoading} style={{ marginTop: '1rem' }}>
                    Save Changes
                  </Button>
                </form>
              </div>
            )}

            {/* ── Travel History tab ── */}
            {activeTab === 'history' && (
              <div className="profile-card">
                <h3 className="profile-form__section-title" style={{ marginBottom: '1.5rem' }}>
                  Completed &amp; Cancelled Stays
                </h3>
                {loadingBookings ? (
                  <Loader message="Loading stay history…" />
                ) : bookings.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    You have no past stays recorded.
                  </p>
                ) : (
                  <div className="profile-history-list">
                    {bookings.map((booking) => {
                      const property = booking.propertyId;
                      if (!property) return null;
                      return (
                        <div key={booking._id} className="history-item">
                          <div className="history-item__left">
                            <span className="history-item__title">{property.title}</span>
                            <span className="history-item__dates">
                              {formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}
                            </span>
                          </div>
                          <span
                            className={`history-item__status-badge history-item__status-badge--${booking.bookingStatus}`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── My Properties tab (host only) ── */}
            {activeTab === 'properties' && isHost && (
              <div className="profile-card">
                <h3 className="profile-form__section-title" style={{ marginBottom: '1.5rem' }}>
                  My Listed Properties
                </h3>
                {loadingProperties ? (
                  <Loader message="Loading your properties…" />
                ) : hostProperties.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    You have not listed any properties yet.
                  </p>
                ) : (
                  <div className="profile-properties-list">
                    {hostProperties.map((prop) => (
                      <div key={prop._id} className="host-property-item">
                        {prop.images?.[0] && (
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="host-property-item__img"
                          />
                        )}
                        <div className="host-property-item__info">
                          <span className="host-property-item__title">{prop.title}</span>
                          <span className="host-property-item__location">
                            {prop.location}, {prop.state}
                          </span>
                          <span className="host-property-item__price">
                            ₹{prop.pricePerNight?.toLocaleString('en-IN')} / night
                          </span>
                        </div>
                        <div className="host-property-item__meta">
                          <span className="host-property-item__category">{prop.category}</span>
                          {prop.featured && (
                            <span className="host-property-item__featured">⭐ Featured</span>
                          )}
                          <span className="host-property-item__rating">
                            ★ {prop.averageRating?.toFixed(1) || '—'} ({prop.totalReviews || 0})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
