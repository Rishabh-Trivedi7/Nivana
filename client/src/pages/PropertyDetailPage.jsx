import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addToWishlist, removeFromWishlist } from '../services/wishlistService.js';
import { getPropertyById } from '../services/propertyService.js';
import PropertyGallery from '../components/property/PropertyGallery.jsx';
import PropertyAmenities from '../components/property/PropertyAmenities.jsx';
import BookingForm from '../components/property/BookingForm.jsx';
import ReviewSection from '../components/property/ReviewSection.jsx';
import StarRating from '../components/common/StarRating.jsx';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import './PropertyDetailPage.css';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingSummary, setRatingSummary] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getPropertyById(id);
        setProperty(res.data.property);
        setRatingSummary({
          averageRating: res.data.property.averageRating,
          totalReviews: res.data.property.totalReviews,
        });
      } catch {
        setError('Property not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return <Loader message="Loading property..." />;
  }

  if (error || !property) {
    return (
      <div className="property-detail__error container">
        <ErrorMessage message={error || 'Property not found'} />
        <Link to="/properties" className="property-detail__back">← Back to all stays</Link>
      </div>
    );
  }

  const displayRating = ratingSummary || property;

  return (
    <div className="property-detail">
      <div className="container">
        <Link to="/properties" className="property-detail__back">← Back to all stays</Link>

        <header className="property-detail__header">
          <div>
            <span className="property-detail__category">{property.category}</span>
            <div className="property-detail__title-container">
              <h1 className="property-detail__title">{property.title}</h1>
              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  const isWishlisted = user?.wishlist?.some(
                    (item) => (item._id || item) === property._id
                  );
                  try {
                    if (isWishlisted) {
                      await removeFromWishlist(property._id);
                    } else {
                      await addToWishlist(property._id);
                    }
                    refreshProfile();
                  } catch (err) {
                    console.error('Error toggling wishlist:', err);
                  }
                }}
                className={`property-detail__wishlist-btn ${
                  user?.wishlist?.some((item) => (item._id || item) === property._id)
                    ? 'property-detail__wishlist-btn--active'
                    : ''
                }`}
                aria-label="Wishlist toggle"
              >
                <span>{user?.wishlist?.some((item) => (item._id || item) === property._id) ? '♥ Saved' : '♡ Save'}</span>
              </button>
            </div>
            <p className="property-detail__location">{property.location}, {property.state}</p>
          </div>
          {displayRating.totalReviews > 0 ? (
            <div className="property-detail__rating">
              <StarRating rating={displayRating.averageRating} />
              <span>{displayRating.averageRating.toFixed(1)} ({displayRating.totalReviews} reviews)</span>
            </div>
          ) : null}
        </header>

        <PropertyGallery images={property.images} title={property.title} />

        <div className="property-detail__layout">
          <div className="property-detail__main">
            <section className="property-detail__section">
              <h2>About this stay</h2>
              <p className="property-detail__description">{property.description}</p>
            </section>

            <section className="property-detail__section">
              <h2>Amenities</h2>
              <PropertyAmenities amenities={property.amenities} />
            </section>

            <section className="property-detail__section">
              <ReviewSection propertyId={property._id} onReviewChange={setRatingSummary} />
            </section>
          </div>

          <aside className="property-detail__sidebar">
            <BookingForm property={property} />
          </aside>
        </div>
      </div>
    </div>
  );
}
