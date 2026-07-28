import './Input.css';

export default function Input({
  label,
  id,
  error,
  className = '',
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={`input-group ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      ) : null}
      <input id={inputId} className={`input-group__input ${error ? 'input-group__input--error' : ''}`} {...props} />
      {error ? <span className="input-group__error">{error}</span> : null}
    </div>
  );
}
