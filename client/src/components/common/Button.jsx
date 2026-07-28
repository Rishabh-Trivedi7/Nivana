import './Button.css';

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
const SIZES = ['sm', 'md', 'lg'];

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    VARIANTS.includes(variant) ? `btn--${variant}` : 'btn--primary',
    SIZES.includes(size) ? `btn--${size}` : 'btn--md',
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      <span className={loading ? 'btn__text--hidden' : ''}>{children}</span>
    </button>
  );
}
