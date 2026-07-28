import './PropertyAmenities.css';

export default function PropertyAmenities({ amenities = [] }) {
  if (!amenities.length) {
    return <p className="amenities__empty">Amenities information coming soon.</p>;
  }

  return (
    <ul className="amenities">
      {amenities.map((item) => (
        <li key={item} className="amenities__item">
          <span className="amenities__icon" aria-hidden="true">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
