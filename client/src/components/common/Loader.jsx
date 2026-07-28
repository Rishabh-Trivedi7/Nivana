import './Loader.css';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="loader" role="status">
      <div className="loader__spinner" aria-hidden="true" />
      <span className="loader__text">{message}</span>
    </div>
  );
}
