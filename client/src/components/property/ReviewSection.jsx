import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getPropertyReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../../services/reviewService.js';
import StarRating from '../common/StarRating.jsx';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import Loader from '../common/Loader.jsx';
import './ReviewSection.css';

function ReviewForm({ initial, onSubmit, onCancel, loading }) {
  const [rating, setRating] = useState(initial?.rating || 0);
  const [comment, setComment] = useState(initial?.comment || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, comment });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label className="review-form__label">Your rating</label>
      <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      <textarea
        className="review-form__textarea"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        required
        maxLength={1000}
      />
      <div className="review-form__actions">
        <Button type="submit" loading={loading} disabled={!rating || !comment.trim()}>
          {initial ? 'Update Review' : 'Submit Review'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export default function ReviewSection({ propertyId, onReviewChange }) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await getPropertyReviews(propertyId);
      setReviews(res.data.reviews);
      setSummary(res.data.summary);
      onReviewChange?.(res.data.summary);
    } catch {
      setError('Unable to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const userReview = reviews.find(
    (r) => r.userId?._id === user?._id || r.userId === user?._id
  );

  const handleCreate = async (data) => {
    setFormLoading(true);
    setError('');
    try {
      await createReview({ propertyId, ...data });
      setShowForm(false);
      await fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    setError('');
    try {
      await updateReview(editingId, data);
      setEditingId(null);
      await fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await deleteReview(id);
      await fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader message="Loading reviews..." />;

  return (
    <section className="review-section">
      <div className="review-section__header">
        <h2 className="review-section__title">Guest Reviews</h2>
        {summary?.totalReviews > 0 ? (
          <div className="review-section__summary">
            <StarRating rating={summary.averageRating} />
            <span>{summary.averageRating.toFixed(1)} · {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}</span>
          </div>
        ) : null}
      </div>

      {summary?.totalReviews > 0 ? (
        <div className="review-breakdown">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.breakdown?.[star] || 0;
            const pct = summary.totalReviews ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={star} className="review-breakdown__row">
                <span>{star} ★</span>
                <div className="review-breakdown__bar">
                  <div className="review-breakdown__fill" style={{ width: `${pct}%` }} />
                </div>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      <ErrorMessage message={error} />

      {isAuthenticated && !userReview && !showForm ? (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          Write a Review
        </Button>
      ) : null}

      {showForm && !userReview ? (
        <ReviewForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={formLoading} />
      ) : null}

      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="review-list__empty">No reviews yet. Be the first to share your experience.</p>
        ) : (
          reviews.map((review) => {
            const isOwner = review.userId?._id === user?._id || review.userId === user?._id;
            const isEditing = editingId === review._id;

            return (
              <article key={review._id} className="review-card">
                {isEditing ? (
                  <ReviewForm
                    initial={review}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingId(null)}
                    loading={formLoading}
                  />
                ) : (
                  <>
                    <div className="review-card__header">
                      <div>
                        <strong>{review.userId?.fullName || 'Guest'}</strong>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {isOwner ? (
                        <div className="review-card__actions">
                          <button type="button" onClick={() => setEditingId(review._id)}>Edit</button>
                          <button type="button" onClick={() => handleDelete(review._id)}>Delete</button>
                        </div>
                      ) : null}
                    </div>
                    <p className="review-card__comment">{review.comment}</p>
                  </>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
