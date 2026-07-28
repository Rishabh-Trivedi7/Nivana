import './PlaceholderPage.css';

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <div className="container">
        <h1>{title}</h1>
        <p>{description}</p>
        <span className="placeholder-page__badge">Coming in next phase</span>
      </div>
    </div>
  );
}
