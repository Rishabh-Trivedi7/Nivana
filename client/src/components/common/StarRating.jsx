import './StarRating.css';

export default function StarRating({
  rating = 0,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
}) {
  return (
    <div
      className={`star-rating star-rating--${size}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Rate this property' : `${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        const filled = interactive ? value <= rating : value <= Math.round(rating);

        if (interactive) {
          return (
            <button
              key={value}
              type="button"
              className={`star-rating__star ${filled ? 'star-rating__star--filled' : ''}`}
              onClick={() => onChange?.(value)}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={value}
            className={`star-rating__star ${filled ? 'star-rating__star--filled' : ''}`}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
