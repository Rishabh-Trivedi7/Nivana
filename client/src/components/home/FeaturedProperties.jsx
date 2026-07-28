import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProperties } from '../../services/propertyService.js';
import PropertyCard from '../property/PropertyCard.jsx';
import Loader from '../common/Loader.jsx';
import Button from '../common/Button.jsx';
import './FeaturedProperties.css';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProperties({ featured: true, limit: 6 })
      .then((res) => setProperties(res.data.properties))
      .catch(() => setError('Unable to load featured stays'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section featured">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Handpicked</span>
          <h2 className="section-title">Featured Stays</h2>
          <p className="section-subtitle">
            Exceptional properties chosen for their character, setting, and experiential depth.
          </p>
        </div>

        {loading ? <Loader message="Loading featured stays..." /> : null}
        {error ? <p className="featured__error">{error}</p> : null}

        {!loading && !error ? (
          <div className="grid-3 featured__grid">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : null}

        <div className="featured__cta">
          <Link to="/properties">
            <Button variant="outline">View All Stays</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
