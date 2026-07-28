import { useState } from 'react';
import './PropertyGallery.css';

export default function PropertyGallery({ images = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length
    ? images
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'];

  return (
    <div className="property-gallery">
      <div className="property-gallery__main">
        <img
          src={gallery[activeIndex]}
          alt={`${title} — image ${activeIndex + 1}`}
          className="property-gallery__hero"
        />
      </div>

      {gallery.length > 1 ? (
        <div className="property-gallery__thumbs">
          {gallery.map((img, idx) => (
            <button
              key={img}
              type="button"
              className={`property-gallery__thumb ${idx === activeIndex ? 'property-gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={img} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
