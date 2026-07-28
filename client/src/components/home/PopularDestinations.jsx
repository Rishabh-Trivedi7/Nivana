import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegionCounts } from '../../services/propertyService.js';
import { POPULAR_DESTINATIONS } from '../../constants/destinations.js';
import './PopularDestinations.css';

export default function PopularDestinations() {
  const [regionCounts, setRegionCounts] = useState({});

  useEffect(() => {
    getRegionCounts()
      .then((res) => setRegionCounts(res.data || {}))
      .catch(() => {/* silently fall back to static counts */});
  }, []);

  const getCount = (stateName) => {
    const key = stateName.toLowerCase();
    const count = regionCounts[key];
    if (count === undefined) return null; // loading — return null to show skeleton
    if (count === 0) return null; // hide if no properties
    return count === 1 ? '1 stay' : `${count} stays`;
  };

  // Only show destinations that have at least 1 property (or while loading show all)
  const isLoading = Object.keys(regionCounts).length === 0;

  const visibleDestinations = POPULAR_DESTINATIONS.filter((dest) => {
    if (isLoading) return true;
    const key = dest.name.toLowerCase();
    return (regionCounts[key] || 0) > 0;
  });

  return (
    <section className="section destinations">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Destinations</span>
          <h2 className="section-title">Popular Regions</h2>
          <p className="section-subtitle">
            From Himalayan peaks to Kerala backwaters — explore India&apos;s most sought-after escape destinations.
          </p>
        </div>

        {visibleDestinations.length === 0 && !isLoading ? (
          <p className="destinations__empty">No destinations available yet. Check back soon!</p>
        ) : (
          <div className="destinations__grid">
            {visibleDestinations.map((dest) => {
              const countLabel = getCount(dest.name);
              return (
                <Link
                  key={dest.name}
                  to={`/properties?state=${encodeURIComponent(dest.name)}`}
                  className={`destination-card${isLoading ? ' destination-card--loading' : ''}`}
                >
                  <img src={dest.image} alt={dest.name} className="destination-card__image" loading="lazy" />
                  <div className="destination-card__overlay">
                    <h3 className="destination-card__name">{dest.name}</h3>
                    <p className="destination-card__tagline">{dest.tagline}</p>
                    {countLabel && (
                      <span className="destination-card__count">{countLabel}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

