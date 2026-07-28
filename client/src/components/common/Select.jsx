import './Select.css';

export default function Select({
  label,
  id,
  error,
  className = '',
  options = [],
  placeholder = 'Select...',
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className={`select-group ${className}`}>
      {label ? (
        <label htmlFor={selectId} className="select-group__label">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`select-group__select ${error ? 'select-group__select--error' : ''}`}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <span className="select-group__error">{error}</span> : null}
    </div>
  );
}
