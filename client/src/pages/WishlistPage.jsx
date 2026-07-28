import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getWishlist } from '../services/wishlistService.js';
import PropertyCard from '../components/property/PropertyCard.jsx';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Button from '../components/common/Button.jsx';
import './WishlistPage.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = async () => {
    try {
      const res = await getWishlist();
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.wishlist]);

  if (loading) {
    return <Loader message="Loading saved stays..." />;
  }

  return (
    <div className="wishlist-page">
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">My Wishlist</h1>
          <p className="page-hero__subtitle">Stays you have saved for future journeys.</p>
        </div>
      </div>

      <div className="container">

        <ErrorMessage message={error} />

        {wishlist.length === 0 ? (
          <div className="wishlist-page__empty">
            <h2 className="wishlist-page__empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-page__empty-desc">
              Tap the heart icon on any retreat to save it for later.
            </p>
            <Link to="/properties">
              <Button>Find Retreats</Button>
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
