import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { addToWishlist, removeFromWishlist } from '../../services/wishlistService.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import './PropertyCard.css';

export default function PropertyCard({ property }) {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';

  const isWishlisted = user?.wishlist?.some(
    (item) => (item._id || item) === property._id
  );

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(property._id);
      } else {
        await addToWishlist(property._id);
      }
      refreshProfile();
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  return (
    <article className="property-card">
      <Link to={`/properties/${property._id}`} className="property-card__image-wrap">
        <img src={image} alt={property.title} className="property-card__image" loading="lazy" />
        {property.featured ? <span className="property-card__badge">Featured</span> : null}
        <button
          onClick={handleWishlistToggle}
          className={`property-card__wishlist ${isWishlisted ? 'property-card__wishlist--active' : ''}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span className="property-card__wishlist-icon">{isWishlisted ? '♥' : '♡'}</span>
        </button>
      </Link>
      <div className="property-card__body">
        <span className="property-card__category">{property.category}</span>
        <Link to={`/properties/${property._id}`}>
          <h3 className="property-card__title">{property.title}</h3>
        </Link>
        <p className="property-card__location">{property.location}, {property.state}</p>
        <div className="property-card__footer">
          <div className="property-card__rating">
            {property.averageRating > 0 ? (
              <>
                <span aria-hidden="true">★</span>
                {property.averageRating.toFixed(1)}
                <span className="property-card__reviews">({property.totalReviews})</span>
              </>
            ) : (
              <span className="property-card__new">New</span>
            )}
          </div>
          <p className="property-card__price">
            {formatCurrency(property.pricePerNight)}
            <span>/ night</span>
          </p>
        </div>
      </div>
    </article>
  );
}
