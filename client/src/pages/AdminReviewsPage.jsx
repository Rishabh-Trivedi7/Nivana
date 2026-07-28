import { useEffect, useState } from 'react';
import { getHostReviews } from '../services/reviewService.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import StarRating from '../components/common/StarRating.jsx';
import './AdminReviewsPage.css';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHostReviews = async () => {
    try {
      const res = await getHostReviews();
      setReviews(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load guest reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostReviews();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader message="Retrieving guest reviews..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="admin-reviews">
      <div className="admin-reviews__header">
        <h1 className="admin-reviews__title">Guest Reviews</h1>
        <p className="admin-reviews__subtitle">
          See what guests are saying about your curated retreats.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="admin-reviews__empty-card">
          <span className="admin-reviews__empty-icon" aria-hidden="true">💬</span>
          <h2 className="admin-reviews__empty-title">No Reviews Yet</h2>
          <p className="admin-reviews__empty-text">
            Once guests check out and submit reviews for your retreats, they will appear here.
          </p>
        </div>
      ) : (
        <div className="admin-reviews__grid">
          {reviews.map((review) => (
            <article key={review._id} className="admin-review-card">
              <header className="admin-review-card__header">
                <div className="admin-review-card__retreat-info">
                  <span className="admin-review-card__tag">
                    {review.propertyId?.location || 'Retreat'}
                  </span>
                  <h3 className="admin-review-card__retreat-title">
                    {review.propertyId?.title || 'Unknown Retreat'}
                  </h3>
                </div>
                <div className="admin-review-card__meta">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="admin-review-card__date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </header>

              <div className="admin-review-card__body">
                <p className="admin-review-card__comment">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              <footer className="admin-review-card__footer">
                <div className="admin-review-card__guest">
                  <div className="admin-review-card__avatar" aria-hidden="true">
                    {review.userId?.fullName?.charAt(0).toUpperCase() || 'G'}
                  </div>
                  <div className="admin-review-card__guest-details">
                    <span className="admin-review-card__guest-name">
                      {review.userId?.fullName || 'Anonymous'}
                    </span>
                    <span className="admin-review-card__guest-email">
                      {review.userId?.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
