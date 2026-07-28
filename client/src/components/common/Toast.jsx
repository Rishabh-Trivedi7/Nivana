import './Toast.css';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="toast" role="status">
      <span>{message}</span>
      {onClose ? (
        <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </div>
  );
}
