import { Link } from 'react-router-dom';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <span className="hero-tag">
            Curated Luxury Stays Across India
          </span>
          <h1>
            India, Beyond The Tourist Maps
          </h1>
          <p>
            Discover peaceful mountain sanctuaries, riverside retreats, forest escapes and premium stays crafted for unforgettable experiences.
          </p>
          <div className="hero-buttons">
            <Link to="/properties" className="btn primary-btn">
              Explore Stays
            </Link>
            <Link to="/properties" className="btn secondary-btn">
              View Experiences
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

